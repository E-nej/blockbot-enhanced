import { useState, useMemo } from 'react';
import { Button } from 'flowbite-react';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizChallengeProps {
    challengerUsername: string;
    onFinishQuiz: (score: number, selectedAnswers: number[], totalQuestions: number) => void;
    onCancel: () => void;
    numQuestions?: number;
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Koliko bitov je 1 byte?",
        "options": ["4", "8", "16"],
        "correctAnswer": 1
    },
    {
        "id": 2,
        "question": "Kaj je RAM?",
        "options": ["Trajni spomin", "Kratkoročni spomin", "Procesor računalnika"],
        "correctAnswer": 1
    },
    {
        "id": 3,
        "question": "Kaj je ROM?",
        "options": ["Trajni spomin", "Kratkoročni spomin", "Procesor računalnika"],
        "correctAnswer": 0
    },
    {
        "id": 4,
        "question": "Kaj je CPU?",
        "options": ["Glavni procesor računalnika", "Računalniški spomin", "Program za urejanje besedila"],
        "correctAnswer": 0
    },
    {
        "id": 5,
        "question": "Kaj je spremenljivka?",
        "options": [
            "Funkcija, ki se izvaja večkrat",
            "Shranjuje podatke, ki se lahko spreminjajo",
            "Poseben tip zanke"
        ],
        "correctAnswer": 1
    },
    {
        "id": 6,
        "question": "Kakšna je razlika med številom in besedilom (string)?",
        "options": [
            "Ni razlike, številka je tekst, string je številka",
            "Številka je količina, string je besedilo",
            "Številka je vedno decimalna, string je vedno celo število"
        ],
        "correctAnswer": 1
    },
    {
        "id": 7,
        "question": "Kaj pomeni += ali -= v programiranju?",
        "options": [
            "Poveča ali zmanjša vrednost spremenljivke",
            "Zamenja vrednost spremenljivke",
            "Ustvari novo spremenljivko"
        ],
        "correctAnswer": 0
    },
    {
        "id": 8,
        "question": "Kaj je pogojni stavek (if/else)?",
        "options": [
            "Ustvari zanko",
            "Preverja pogoj",
            "Definira spremenljivko"
        ],
        "correctAnswer": 1
    },
    {
        "id": 9,
        "question": "Kaj je zanka (loop)?",
        "options": [
            "Funkcija",
            "Spremenljivka",
            "Del kode ki se ponavlja večkrat"
        ],
        "correctAnswer": 2
    },
    {
        "id": 10,
        "question": "Kako se razlikuje for zanka od while zanke?",
        "options": [
            "For se ponovi dokler je pogoj resničen, while pa točno določeno število",
            "For se ponovi določeno število, while pa dokler je pogoj resničen",
            "For je samo za števila, while za besedila"
        ],
        "correctAnswer": 1
    },
    {
        "id": 11,
        "question": "Kolikokrat se izvede zanka: for i in range(3)",
        "options": ["1", "3", "5"],
        "correctAnswer": 1
    },
    {
        "id": 12,
        "question": "Kolikokrat se izvede zanka: for i in range(2,7)",
        "options": ["3", "4", "5"],
        "correctAnswer": 2
    },
    {
        "id": 13,
        "question": "Kaj je razhroščevanje oziroma debugging?",
        "options": [
            "Pisanje novih funkcij",
            "Iskanje in popravljanje napak v programu",
            "Shrani datoteko"
        ],
        "correctAnswer": 1
    },
    {
        "id": 14,
        "question": "Kaj je algoritem?",
        "options": [
            "Program",
            "Zaporedje korakov za reševanje problema",
            "Programski jezik"
        ],
        "correctAnswer": 1
    },
    {
        "id": 15,
        "question": "Kaj se zgodi, če je pogoj v if napačen in imamo else?",
        "options": [
            "Koda se ne izvede",
            "Izvede se koda v bloku else",
            "Program se ustavi"
        ],
        "correctAnswer": 1
    },
    {
        "id": 16,
        "question": "Kaj naredi logični operator OR?",
        "options": [
            "Pogoj je resničen, če sta oba pogoja resnična",
            "Pogoj je vedno napačen",
            "Pogoj je resničen, če je vsaj eden pogoj resničen"
        ],
        "correctAnswer": 2
    },
    {
        "id": 17,
        "question": "Kateri podatkovni tip je primerno uporabiti za besedilo?",
        "options": ["String", "Integer", "Boolean"],
        "correctAnswer": 0
    },
    {
        "id": 18,
        "question": "Kateri podatkovni tip je primerno uporabiti za število celih števil?",
        "options": ["String", "Integer (int)", "Boolean"],
        "correctAnswer": 1
    },
    {
        "id": 19,
        "question": "Kaj bo vrednost spremenljivke x po izvedbi kode:\nx = 5\nx += 3",
        "options": ["5", "3", "8"],
        "correctAnswer": 2
    },
    {
        "id": 20,
        "question": "Kaj naredi operator % v programiranju?",
        "options": [
            "Deli in vrne rezultat deljenja",
            "Vrne ostanek pri deljenju",
            "Pomnoži dva števila"
        ],
        "correctAnswer": 1
    },
    {
        "id": 21,
        "question": "Kaj je funkcija v programiranju?",
        "options": [
            "Spremenljivka, ki hrani številke",
            "Blok kode, ki izvede določeno nalogo in ga lahko večkrat pokličemo",
            "Tip zanke"
        ],
        "correctAnswer": 1
    },
    {
        "id": 22,
        "question": "Kaj je Boolean podatkovni tip?",
        "options": [
            "Decimalno število",
            "Besedilo",
            "Vrednost, ki je lahko samo true ali false"
        ],
        "correctAnswer": 2
    },
    {
        "id": 23,
        "question": "Kaj naredi logični operator AND?",
        "options": [
            "Pogoj je resničen, če sta oba pogoja resnična",
            "Pogoj je resničen, če je vsaj eden pogoj resničen",
            "Obrne vrednost pogoja"
        ],
        "correctAnswer": 0
    },
    {
        "id": 24,
        "question": "Kaj je seznam (list) v programiranju?",
        "options": [
            "Ena sama vrednost",
            "Zbirka več vrednosti shranjenih skupaj",
            "Funkcija za izpis"
        ],
        "correctAnswer": 1
    },
    {
        "id": 25,
        "question": "Kaj vrne len('Hello') v Pythonu?",
        "options": ["Hello", "5", "4"],
        "correctAnswer": 1
    },
    {
        "id": 26,
        "question": "Kateri indeks ima prvi element v seznamu?",
        "options": ["0", "1", "-1"],
        "correctAnswer": 0
    },
    {
        "id": 27,
        "question": "Kaj pomeni 'sintaksna napaka' (syntax error)?",
        "options": [
            "Program deluje prepočasi",
            "Koda ni napisana po pravilih programskega jezika",
            "Program porabi preveč pomnilnika"
        ],
        "correctAnswer": 1
    },
    {
        "id": 28,
        "question": "Kaj naredi ukaz print()",
        "options": [
            "Prebere vnos uporabnika",
            "Izpiše vrednost na zaslon",
            "Shrani podatke v datoteko"
        ],
        "correctAnswer": 1
    },
    {
        "id": 29,
        "question": "Kaj je komentar v kodi?",
        "options": [
            "Koda, ki se izvede prva",
            "Besedilo, ki ga računalnik ignorira in služi za pojasnilo",
            "Napaka v programu"
        ],
        "correctAnswer": 1
    },
    {
        "id": 30,
        "question": "Kaj bo rezultat izraza: 10 // 3 v Pythonu?",
        "options": ["3.33", "3", "1"],
        "correctAnswer": 1
    },
    {
        "id": 31,
        "question": "Kaj naredi ukaz input()?",
        "options": [
            "Izpiše besedilo na zaslon",
            "Počaka, da uporabnik vnese podatek",
            "Konča program"
        ],
        "correctAnswer": 1
    }
];

function getRandomQuestions(numQuestions: number): QuizQuestion[] {
    const shuffled = DEFAULT_QUESTIONS.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}

export default function QuizChallenge({
    challengerUsername,
    onFinishQuiz,
    onCancel,
    numQuestions = 3
}: QuizChallengeProps) {
    const questions = useMemo(() => getRandomQuestions(numQuestions), [numQuestions]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
        Array(questions.length).fill(-1)
    );
    const [quizFinished, setQuizFinished] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const handleAnswerSelect = (optionIndex: number) => {
        const newSelectedAnswers = [...selectedAnswers];
        newSelectedAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newSelectedAnswers);
    };


    const calculateScore = () => {
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === questions[index].correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const finalScore = calculateScore();
            setScore(finalScore);
            setQuizFinished(true);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = () => {
        const finalScore = calculateScore();
        onFinishQuiz(finalScore, selectedAnswers, questions.length);
    };

    if (quizFinished) {
        return (
            <div className="p-8 bg-white max-w-md mx-auto mt-10">
                <h4 className="text-2xl font-bold mb-4 text-center">Kviz zaključen!</h4>
                <h4 className={`mb-6 text-center text-lg font-semibold ${score >= Math.ceil(questions.length / 2) ? 'text-teal-600' : 'text-red-500'}`}>
                    Dosegli ste <span className="font-bold">{score}</span> od <span className="font-bold">{questions.length}</span> točk.<br />
                    {score >= Math.ceil(questions.length / 2)
                        ? "Čestitamo, zmagali ste izziv :)"
                        : "Žal niste uspeli premagati izziva :("}
                </h4>
                <div className="flex justify-center gap-4">
                    <Button color="gray" onClick={onCancel}>
                        ← Nazaj
                    </Button>
                    <Button color="teal" onClick={handleSubmitQuiz} className="px-6">
                        ➤ Pošlji rezultat
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Vprašanje {currentQuestionIndex + 1}/{questions.length}</h3>
                    <span className="text-sm text-teal-600 font-semibold">
                        Izziv od: {challengerUsername}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-teal-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">{currentQuestion.question}</h4>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            className={`w-full p-3 text-left rounded-lg border ${selectedAnswers[currentQuestionIndex] === index
                                ? 'bg-teal-50 border-teal-500 text-teal-700 font-semibold'
                                : 'bg-white border-gray-300 hover:border-teal-400'
                                }`}
                            onClick={() => handleAnswerSelect(index)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                <div>
                    <Button
                        color="gray"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-4"
                    >
                        ← Nazaj
                    </Button>
                </div>
                <div className="flex gap-3">
                    <Button color="gray" onClick={onCancel}>
                        Prekliči
                    </Button>
                    <Button
                        color="success"
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                        className="px-6"
                    >
                        {currentQuestionIndex === questions.length - 1 ? '✓ Zaključi' : 'Naprej →'}
                    </Button>
                </div>
            </div>
        </div>
    );
}