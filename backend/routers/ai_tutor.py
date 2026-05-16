from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
import uuid, os
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter()

HINTS = {
    "pendulum": {
        "key_principle": "The period T = 2π√(L/g). Only length affects period — mass and angle (for small angles) do not!",
        "formula": "T = 2π√(L/g) where L = length (m), g = 9.8 m/s²",
        "hint": "Try doubling the length and observe how the period changes. It should increase by √2 ≈ 1.41×",
        "observation": "Record the time for 10 oscillations and divide by 10 for an accurate period measurement.",
    },
    "ohms-law": {
        "key_principle": "Voltage = Current × Resistance (V = IR). This is Ohm's Law.",
        "formula": "V = IR where V = Volts, I = Amperes, R = Ohms",
        "hint": "Keep resistance constant and vary voltage. Plot V on X-axis and I on Y-axis — slope gives 1/R",
        "observation": "When resistance doubles for constant voltage, current halves. Verify this!",
    },
    "acid-base": {
        "key_principle": "pH < 7 = Acidic, pH = 7 = Neutral, pH > 7 = Basic/Alkaline",
        "formula": "pH = -log[H⁺]",
        "hint": "Litmus turns red in acid and blue in base. Phenolphthalein is colourless in acid, pink in base.",
        "observation": "Test lemon juice (acidic), baking soda (basic), and pure water (neutral) to calibrate your understanding.",
    },
    "photosynthesis": {
        "key_principle": "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        "formula": "Rate of photosynthesis ∝ light intensity (up to saturation point)",
        "hint": "At very high light intensity, the rate plateaus — CO₂ becomes the limiting factor.",
        "observation": "Count oxygen bubbles per minute as a proxy for photosynthesis rate.",
    },
    "projectile": {
        "key_principle": "Horizontal and vertical motions are completely independent. Gravity only acts vertically.",
        "formula": "Range R = v²sin(2θ)/g | Max Height H = v²sin²(θ)/(2g) | Time T = 2v·sinθ/g",
        "hint": "Maximum range is achieved at 45°. Complementary angles (e.g. 30° and 60°) give equal ranges!",
        "observation": "Notice that increasing angle beyond 45° reduces range but increases max height.",
    },
}

DEFAULT_HINT = {
    "key_principle": "Observe how changing each variable affects the outcome. Look for cause-and-effect relationships.",
    "formula": "Record your measurements systematically and look for mathematical patterns.",
    "hint": "Start with one variable at a time — keep others constant. This is the scientific method!",
    "observation": "Record at least 5 data points to draw meaningful conclusions.",
}

class HintRequest(BaseModel):
    experimentId: str
    context: Optional[str] = "general"

class AnalyzeRequest(BaseModel):
    experimentId: str
    observations: list
    score: int

class QuizResponse(BaseModel):
    question: str
    options: list
    correct: int
    explanation: str

QUIZZES = {
    "pendulum": [
        {"question": "What happens to the period if you double the pendulum length?", "options": ["Doubles", "Halves", "Increases by √2", "No change"], "correct": 2, "explanation": "T ∝ √L, so doubling L increases T by √2 ≈ 1.41×"},
        {"question": "Which factor does NOT affect the period of a simple pendulum?", "options": ["Length", "Mass of bob", "Gravity", "Both A and B"], "correct": 1, "explanation": "For small angles, only length and gravity affect period. Mass has no effect."},
    ],
    "ohms-law": [
        {"question": "If voltage doubles and resistance stays constant, current:", "options": ["Halves", "Doubles", "Stays same", "Quadruples"], "correct": 1, "explanation": "I = V/R. If V doubles and R is constant, I doubles."},
    ],
}

@router.post("/hint")
async def get_hint(req: HintRequest, current_user=Depends(get_current_user), db=Depends(get_db)):
    hints = HINTS.get(req.experimentId, DEFAULT_HINT)
    hint_text = hints.get(req.context, hints.get("hint", DEFAULT_HINT["hint"]))

    interaction_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO ai_interactions (id, user_id, experiment_id, message, response, interaction_type) VALUES (?,?,?,?,?,?)",
        (interaction_id, current_user["id"], req.experimentId, req.context or "hint", hint_text, "hint")
    )
    await db.commit()

    return {
        "hint": hint_text,
        "key_principle": hints.get("key_principle"),
        "formula": hints.get("formula"),
        "experiment_id": req.experimentId,
    }

@router.post("/analyze")
async def analyze_response(req: AnalyzeRequest, current_user=Depends(get_current_user)):
    gaps = []
    recommendations = []

    if req.score < 50:
        gaps.append(f"Significant understanding gaps in {req.experimentId}")
        recommendations.append("Review the theory section and retry with different variable combinations")
        recommendations.append("Watch the step-by-step walkthrough before attempting again")
    elif req.score < 75:
        gaps.append(f"Partial understanding — some concepts need reinforcement")
        recommendations.append("Focus on the relationship between variables you found confusing")
    else:
        recommendations.append("Excellent work! Try the advanced challenge questions")
        recommendations.append("You're ready to move to the next experiment in this chapter")

    return {
        "score": req.score,
        "performance": "excellent" if req.score >= 85 else "good" if req.score >= 70 else "needs_improvement",
        "gaps": gaps,
        "recommendations": recommendations,
        "next_experiment": "ohms-law" if req.experimentId == "pendulum" else "photosynthesis",
    }

@router.post("/quiz/{experiment_id}")
async def generate_quiz(experiment_id: str, current_user=Depends(get_current_user)):
    questions = QUIZZES.get(experiment_id, [
        {
            "question": f"What is the main learning objective of the {experiment_id.replace('-',' ').title()} experiment?",
            "options": ["Measure variables", "Understand cause-effect", "Apply the formula", "All of the above"],
            "correct": 3,
            "explanation": "All three objectives are important in any NCERT science experiment."
        }
    ])
    return {"experiment_id": experiment_id, "questions": questions}
