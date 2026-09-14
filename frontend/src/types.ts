export interface ExamDetails {
    _id: string;
    title: string;
    description: string;
    duration: number;
    totalMark: number;
    instructions: string;
    scheduleStart: string;
    scheduleEnd: string;
    isActive: boolean;
    status: string;
    organizationId: string;
    examNumber: number;
    examCode: string;
    numberOfQuestions: number;
    passingMark: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface QuestionOption {
    _id: string;
    text: string;
    isCorrect: boolean;
}

export type QuestionStatus =
    | "pending"
    | "answered"
    | "skipped"
    | "review";

export interface Question {
    _id: string;
    text: string;
    options: QuestionOption[];
    exam: string;
    createdBy: string;
    status: QuestionStatus;
    createdAt: string;
    updatedAt: string;
    questionNumber: number;
    questionCode: string;
    isActive: boolean;
    organizationId: string;
    __v: number;
}

export interface CandidateQuestion {
    _id: string;
    question: Question;
    selectedOptionIndex: number | null;
    selectedOptionText: string;
}

export interface CandidateExamResponse {
    examDetails: ExamDetails;
    questionArray: CandidateQuestion[];
}