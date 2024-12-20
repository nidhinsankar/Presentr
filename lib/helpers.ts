"use server";

import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import prisma from "./prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import axios from "axios";
import { DOMParser } from "xmldom";
import OpenAI from "openai";
import z, { array } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import pptxgen from "pptxgenjs";
import { randomUUID } from "crypto";
import path from "path";
import { UTApi } from "uploadthing/server";
import fs from "fs-extra";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const utapi = new UTApi({ apiKey: process.env.UPLOADTHNG_SECRET });
const CURRENT_MODEL = "gpt-4o-mini";

const ContentStructure = z.object({
  title: z.string(),
  content: z.array(z.string()),
});

const arrayOfObjectsSchema = z.object({
  arrayOfObjects: z.array(ContentStructure),
});

const TitleAndDescription = z.object({
  title: z.string(),
  description: z.string(),
});

export async function RunAuthCheck() {
  try {
    const { getUser } = getKindeServerSession();
    const user = (await getUser()) as KindeUser;
    if (!user) return { success: false };

    if (!user.id || !user.email) return { success: false };

    const dbUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.given_name + " " + user.family_name,
        },
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function CheckVideoDetails(id: string) {
  const options = {
    method: "GET",
    url: "https://yt-api.p.rapidapi.com/video/info",
    params: { id },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "yt-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    if (!response.data.lengthSeconds) {
      throw new Error("Failed to get video length in seconds");
    }

    if (!response.data.subtitles.subtitles[0]) {
      throw new Error("Failed to get video subtitles");
    }

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function ParseXML(url: string) {
  try {
    const response = await axios.get(url);
    const xmlString = response.data;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const textElements = xmlDoc.getElementsByTagName("text");

    const results = [];
    for (let i = 0; i < textElements.length; i++) {
      const textContent = textElements[i].textContent;
      results.push(textContent);
    }

    console.log("result-in-parse", results);
    if (!xmlDoc) throw new Error("XML Parsing resulted in an empty document.");
    return results;
  } catch (error) {
    console.error("Error fetching or parsing XML:", error);
    throw error;
  }
}

export async function CleanseTranscript(data: any) {
  try {
    const newData = data.join(" ");
    console.log(newData);

    const requestBody = {
      command: `Tidy the grammar and punctuation of the following text 
    which was autogenerated from a YouTube video.  Where appropriate correct the words which are spelled incorrectly. : ${newData}`,
    };

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an AI designed to tidy text." },
        { role: "user", content: requestBody.command },
      ],
      model: CURRENT_MODEL,
    });

    const tidiedText = completion.choices[0].message.content;
    console.log("tidiedText", tidiedText);

    return tidiedText;
  } catch (error) {
    console.error("Error cleansing transcript:", error);
    throw new Error("Failed to cleanse transcript");
  }
}

export async function ConvertTextToArrayContent(
  text: string,
  slideCount: number
): Promise<{
  arrayOfObjects: {
    title: string;
    content: string[];
  }[];
}> {
  try {
    if (!slideCount) {
      slideCount = 5;
    }

    const requestBody = {
      command: `From the string ${text}, create an array of objects with a title and content property. The content property should be an array of strings. The array should have ${slideCount} objects.
        Do not just split the text into parts. You need to reword it, improve it and make it friendly for a presentation. I have provided a schema for you to follow.
          There should be a minimum of 3 content items per objects and a maximum of 4. No string in the content object should exceed 170 characters.
        `,
    };

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content:
            "You are an AI designed to convert text to an array of content suitable for a presentation.",
        },
        {
          role: "user",
          content: requestBody.command,
        },
      ],
      model: "gpt-4o-2024-08-06",
      response_format: zodResponseFormat(
        arrayOfObjectsSchema,
        "arrayOfObjects"
      ),
    });

    if (!completion.choices[0].message.parsed) {
      throw new Error("Failed to convert text to array of content");
    }
    console.log("convertTexttoArray", completion.choices[0].message.parsed);

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("Error converting text to array of content:", error);
    throw new Error("Failed to convert text to array of content");
  }
}

export async function CreateTitleAndDescription(contentArray: any) {
  try {
    const requestBody = {
      command: `From the array of objects ${JSON.stringify(
        contentArray
      )}, create a title and description suitable for a presentation. The title should be no longer than 15 words and the description should be no longer than 35 words.`,
    };

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content:
            "You are an AI designed to create a title and description for a presentation.",
        },
        {
          role: "user",
          content: requestBody.command,
        },
      ],
      model: CURRENT_MODEL,
      response_format: zodResponseFormat(
        TitleAndDescription,
        "titleAndDescription"
      ),
    });

    if (!completion.choices[0].message.parsed) {
      throw new Error("Failed to create title and description");
    }
    console.log("title-anddescription", completion.choices[0].message.parsed);

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("Error creating title and description:", error);
    throw new Error("Failed to create title and description");
  }
}

export async function ImprovePresentationContent(content: any) {
  try {
    const requestBody = {
      command: `I am giving you an array of objects and each represents content for a presentation. I want you to loop over each object and improve the content and elaborate upon it so it reaches around 250 characters, remove any unnecessary information and make it more engaging. No string in the content array should be longer than 250 characters.
        remove any references to the content coming from a YouTube video or any other source. I have provided a schema for how I want the data returned and the data to improve is follows: ${JSON.stringify(
          content
        )}
      `,
    };

    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content: "You are an AI designed to improve presentation content.",
        },
        {
          role: "user",
          content: requestBody.command,
        },
      ],
      model: CURRENT_MODEL,
      response_format: zodResponseFormat(
        arrayOfObjectsSchema,
        "arrayOfObjects"
      ),
    });

    console.log(
      "improve presentationContent",
      completion.choices[0].message.parsed
    );

    if (!completion.choices[0].message.parsed) {
      throw new Error("Failed to improve presentation content");
    }

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("Error improving presentation content:", error);
    throw new Error("Failed to improve presentation content");
  }
}

export async function CreatePresentationFromArrayOfObjects(
  arrayOfObjects: any,
  user: KindeUser
) {
  try {
    console.log(arrayOfObjects);
    const pptx = new pptxgen();

    arrayOfObjects.forEach((slide: any) => {
      const slideForPresentation = pptx.addSlide();

      slideForPresentation.addText(slide.title, {
        x: 0.5,
        y: 0.8,
        fontSize: 24,
        bold: true,
        color: "#000000",
      });

      slide.content.forEach((content: string, index: number) => {
        const yPosition = 1.8 + index * 1.4;

        slideForPresentation.addText(content, {
          x: 0.5,
          y: yPosition,
          fontSize: 15,
          color: "#000000",
        });
      });
    });

    const fileName = `presentation-${randomUUID()}-userId=${user.id}.pptx`;
    const filePath = path.join("/tmp", fileName);

    await pptx.writeFile({ fileName: filePath });

    return {
      filePath,
      fileName,
    };
  } catch (error) {
    console.error("Error creating presentation from array of objects:", error);
    throw new Error("Failed to create presentation from array of objects");
  }
}

export async function UploadPowerpointToToUploadThing(
  file: Buffer,
  fileName: string
) {
  try {
    const fileObj = new File([file], `${fileName}`, {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });

    const response = await utapi.uploadFiles([fileObj]);

    return response;
  } catch (error) {
    throw new Error("Failed to upload powerpoint to UploadThing");
  }
}

export async function DeductCoinsAndSavePresentationURL(
  url: string,
  userId: string,
  path: string,
  titleAndDesc: {
    title: string;
    description: string;
  },
  slideCount: string,
  source: string
) {
  try {
    // const updatedUser = await prisma.user.update({
    //   where: {
    //     id: userId,
    //   },
    //   data: {
    //     tokenCount: {
    //       decrement: 1,
    //     },
    //   },
    // });

    const savedPresentation = await prisma.generatedPowerpoints.create({
      data: {
        link: url,
        ownerId: userId,
        sourceURL: source,
        slideCount: Number(slideCount),
        title: titleAndDesc.title,
        description: titleAndDesc.description,
      },
    });

    fs.unlink(path);

    return {
      success: true,
      savedPresentation: savedPresentation,
    };
  } catch (error) {
    throw new Error("Failed to deduct coins and save presentation URL");
  }
}
