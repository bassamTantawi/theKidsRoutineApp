import { Action, z, actions } from "@botpress/runtime";

/**
 * Action to analyze an image using OpenAI and extract structured information.
 * This is particularly useful for extracting event information from images.
 */
export default new Action({
  name: "analyze_image",
  input: z.object({
    image_url: z.string().describe("URL of the image to analyze"),
    prompt: z
      .string()
      .optional()
      .describe("System prompt for image analysis (defaults to event extraction prompt)"),
    temperature: z
      .number()
      .optional()
      .default(0.7)
      .describe("Temperature for the OpenAI model (0-2)"),
  }),
  output: z.object({
    output: z.string().describe("The extracted information from the image"),
  }),
  handler: async ({ input }) => {
    const defaultPrompt = `You are an expert at extracting information from images. Your task is to analyze the uploaded image and extract as much relevant information as possible.

When analyzing images, look for:
- Event names, titles, or descriptions
- Dates and times (start and end times if available)
- Locations or venues
- Participants or attendees
- Any other relevant details

If the image appears to contain event information (like a calendar, invitation, flyer, or event poster), extract all the details in a structured format. Be thorough and extract every piece of information you can see.

Return the extracted information in a clear, structured format that can be easily parsed.`;

    const systemPrompt = input.prompt || defaultPrompt;

    const { choices } = await actions.openai.generateContent({
      model: {
        id: "gpt-4o-mini-2024-07-18",
      },
      temperature: Math.max(0, Math.min(2, input.temperature ?? 0.7)),
      topP: 1,
      systemPrompt: systemPrompt,
      messages: [
        {
          role: "user",
          type: "multipart",
          content: [
            {
              type: "image",
              url: input.image_url,
            },
          ],
        },
      ],
    });

    if (!choices.length) {
      throw new Error("Did not get a response back from OpenAI");
    }

    return {
      output: choices[0].content,
    };
  },
});

