import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import {
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  CognitoIdentityProviderClient,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";

const app = express();

app.use(cors());
app.use(express.json());

const client = new CognitoIdentityProviderClient({
  region: "us-east-2",
});

const CLIENT_ID = "";   //USE YOUR OWN AWS API

const groq = new Groq({
  apiKey: "",           //USE YOUR OWN Groq LLM API
});

async function llmCallGroq(topic, numberOfQuestions, difficulty) {
    const prompt = `
        This is a quiz app.

        Generate ${numberOfQuestions} multiple choice questions about ${topic}.

        Difficulty level: ${difficulty}

        Rules:
        - Each question must have exactly 4 options.
        - Only one option is correct.
        - Return ONLY valid JSON.
        - Do NOT include explanations or extra text.

        JSON format must be:

        {
        "questions": [
            {
            "question": "string",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": "one of the options"
            }
        ]
        }
        `;
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "openai/gpt-oss-20b",
            temperature: 0.7,
            max_completion_tokens: 4000,
            top_p: 1,
            stream: false,
            reasoning_effort: "medium"
        });

        const content = chatCompletion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content returned from Groq");
        }

        const parsedQuiz = JSON.parse(content);
        return parsedQuiz;

    } catch (e) {
        console.error("Groq error:", e);
        throw new Error("Failed to generate quiz");
    }
}


async function logIn_AWSCognito(email, password) {
  const params = {
    ClientId: CLIENT_ID,
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  try {
    console.log("LOGIN PARAMS:", params);

    const command = new InitiateAuthCommand(params);
    const data = await client.send(command);

    console.log("User signed in successfully");

    return data.AuthenticationResult;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

async function register_AWSCognito(name, email, password) {
  const params = {
    ClientId: CLIENT_ID,
    Username: name,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "name",
        Value: name,
      },
    ],
  };

  try {
    console.log("FINAL SIGNUP PARAMS =", JSON.stringify(params, null, 2));

    const command = new SignUpCommand(params);
    const data = await client.send(command);

    console.log("User registered successfully:", data.UserSub);

    return {
      success: true,
      message: "User registered successfully. Check your email for verification code.",
      userSub: data.UserSub,
      userConfirmed: data.UserConfirmed,
      username: name,
    };
  } catch (error) {
    console.error("Register error:", error);

    if (error.name === "UsernameExistsException") {
      return {
        success: false,
        code: "USERNAME_EXISTS",
        message: "This username is already taken.",
      };
    }

    if (error.name === "AliasExistsException") {
      return {
        success: false,
        code: "EMAIL_EXISTS",
        message: "An account with this email already exists.",
      };
    }

    if (error.name === "InvalidPasswordException") {
      return {
        success: false,
        code: "INVALID_PASSWORD",
        message: error.message,
      };
    }

    if (error.name === "InvalidParameterException") {
      return {
        success: false,
        code: "INVALID_PARAMETER",
        message: error.message,
      };
    }

    return {
      success: false,
      code: "REGISTER_FAILED",
      message: error.message || "Registration failed.",
    };
  }
}

async function confirm_AWSCognito(username, code) {
  const params = {
    ClientId: CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  };

  try {
    console.log("CONFIRM PARAMS:", params);

    const command = new ConfirmSignUpCommand(params);
    const data = await client.send(command);

    console.log("User confirmed successfully");

    return data;
  } catch (error) {
    console.error("Confirm error:", error);
    throw error;
  }
}

async function resendCode_AWSCognito(username) {
  const params = {
    ClientId: CLIENT_ID,
    Username: username,
  };

  try {
    console.log("RESEND PARAMS:", params);

    const command = new ResendConfirmationCodeCommand(params);
    const data = await client.send(command);

    console.log("New confirmation code sent");

    return data;
  } catch (error) {
    console.error("Resend code error:", error);
    throw error;
  }
}

async function forgotPassword_AWSCognito(email) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
  };

  try {
    console.log("FORGOT PASSWORD PARAMS:", params);

    const command = new ForgotPasswordCommand(params);
    const data = await client.send(command);

    console.log("Password reset code sent successfully");

    return data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
}

async function confirmForgotPassword_AWSCognito(email, code, newPassword) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  };

  try {
    console.log("CONFIRM FORGOT PASSWORD PARAMS:", params);

    const command = new ConfirmForgotPasswordCommand(params);
    const data = await client.send(command);

    console.log("Password reset successfully");

    return data;
  } catch (error) {
    console.error("Confirm forgot password error:", error);
    throw error;
  }
}


app.get("/", (req, res) => {
  res.send("Backend working");
});


app.post("/generateQuiz", async (req, res) => {
  try {
    const { topic, numberOfQuestions, difficulty } = req.body;

    console.log("generateQuiz API Called:", {
      topic,
      numberOfQuestions,
      difficulty
    });

    const result = await llmCallGroq(topic, numberOfQuestions, difficulty);

    res.status(200).json({
      message: "Quiz generated successfully",
      topic: topic,
      difficulty: difficulty,
      numberOfQuestions: numberOfQuestions,
      quiz: result
    });

  } catch (error) {
    console.error("Generate quiz error:", error);

    res.status(500).json({
      error: error.message || "Quiz generation failed"
    });
  }
});



app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER RECEIVED:", { name, email, password });

    const result = await register_AWSCognito(name, email, password);
    
    res.json({
      message: "User registered successfully. Check your email for verification code.",
      userSub: result.UserSub,
      userConfirmed: result.UserConfirmed,
      username: result.username,
      user: {
        id: result.UserSub,
        email,
        name,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Registration failed",
    });
  }
});

app.post("/confirm", async (req, res) => {
  try {
    const { username, code } = req.body;

    console.log("CONFIRM RECEIVED:", { username, code });

    if (!username || !code) {
      return res.status(400).json({
        error: "username and code are required",
      });
    }

    const result = await confirm_AWSCognito(username, code);

    res.json({
      message: "User confirmed successfully",
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Confirmation failed",
    });
  }
});

app.post("/resend-code", async (req, res) => {
  try {
    const { username } = req.body;

    console.log("RESEND CODE RECEIVED:", { username });

    if (!username) {
      return res.status(400).json({
        error: "username is required",
      });
    }

    const result = await resendCode_AWSCognito(username);

    res.json({
      message: "New verification code sent",
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Resend code failed",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN RECEIVED:", { email, password });

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      });
    }

    const result = await logIn_AWSCognito(email, password);

    res.json({
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresIn: result.ExpiresIn,
      tokenType: result.TokenType,
      user: {
        email,
      },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Login failed",
    });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("FORGOT PASSWORD RECEIVED:", { email });

    if (!email) {
      return res.status(400).json({
        error: "email is required",
      });
    }

    const result = await forgotPassword_AWSCognito(email);

    res.json({
      message: "Password reset code sent to your email.",
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Could not send reset code",
    });
  }
});

app.post("/confirm-forgot-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    console.log("CONFIRM FORGOT PASSWORD RECEIVED:", {
      email,
      code,
      newPassword,
    });

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: "email, code, and newPassword are required",
      });
    }

    const result = await confirmForgotPassword_AWSCognito(
      email,
      code,
      newPassword
    );

    res.json({
      message: "Password reset successfully.",
      result,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message || "Could not reset password",
    });
  }
});

const PORT = 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("BACKEND STARTED");
  console.log(`http://localhost:${PORT}`);
});



