import { DEFAULT_MODEL } from "@/constants";
import apiClient from "./apiClient";

export interface IResponse {
  message: string;  // Diu si d'ha rebut o no resposta
  response: string;
  done: boolean;
  done_reason: string;
}

export async function askAssistant(prompt:string): Promise<IResponse> {
  try {
    const res = await apiClient.post(
      "/llm/generate",
      {
        model: DEFAULT_MODEL,
        prompt,
      }
    );

    if (res.status == 200) {
      return res.data as IResponse;
    }

    else if (res.status == 400) {
      return {
        message: res.data.message,
        response: "Rere has been an error with missing parameters, please try again and, if the error persists, please, contact us.",
        done: true,
        done_reason: "Error"
      }
    }

    else {
      return {
        message: res.data.message,
        response: "Rere has been an error with the server, please try again and, if the error persists, please, contact us.",
        done: true,
        done_reason: "Error"
      };
    }
  } catch (err) {
    return {
      message: "Unknown Error",
      response: "There has been an unknown error, please try again and, if the error persists, please, contact us.",
      done: true,
      done_reason: "Error",
    }
  }
}
