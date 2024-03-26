import {strict_output} from '@/lib/gpt';
import {getAuthSession} from '@/lib/nextauth';
import {getQuestionsSchema} from '@/schemas/questions';
import {NextResponse} from 'next/server';
import {ZodError} from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 500;

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    const body = await req.json();
    // const {amount, topic, type} = getQuestionsSchema.parse(body);
    const {amount, topic, type} = body;

    // Define a maximum chunk size
    const chunkSize = 5; // Adjust this value as needed

    // Create an array to hold all generated questions
    let allQuestions: any[] = [];
    // Create prompts based on the requested amount in batches
    for (let i = 0; i < amount; i += chunkSize) {
      const prompts: string[] = [];
      // Generate prompts for the current batch
      for (let j = i; j < Math.min(i + chunkSize, amount); j++) {
        prompts.push(
          `You are to generate a random hard ${type} question about ${topic}`,
        );
        let questionsBatch: any;
        if (type === 'open_ended') {
          questionsBatch = await strict_output(
            'You are a helpful AI that is able to generate a pair of question and answers, the length of each answer should not be more than 15 words, store all the pairs of answers and questions in a JSON array',
            new Array(amount).fill(
              `You are to generate a random hard open-ended questions about ${topic}`,
            ),
            {
              question: 'question',
              answer: 'answer with max length of 15 words',
            },
          );
        } else if (type === 'mcq') {
          questionsBatch = await strict_output(
            'You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array',
            new Array(amount).fill(
              `You are to generate a random hard mcq question about ${topic}`,
            ),
            {
              question: 'question',
              answer: 'answer with max length of 15 words',
              option1: 'option1 with max length of 15 words',
              option2: 'option2 with max length of 15 words',
              option3: 'option3 with max length of 15 words',
            },
          );
        }
        allQuestions = allQuestions.concat(questionsBatch);
      }
    }
    return NextResponse.json(
      {
        questions: allQuestions,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {error: error.issues},
        {
          status: 400,
        },
      );
    } else {
      console.error('elle gpt error', error);
      return NextResponse.json(
        {error: 'An unexpected error occurred. ' + error},
        {
          status: 500,
        },
      );
    }
  }
}
