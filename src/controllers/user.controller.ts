import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Models from "../models";
import { getUserByEmail, getUserById, getUserByPhone } from "../services/user.service";
import {
  comparePassword,
  encryptPassword,
  generateRandomString,
  generateToken,
  sendErrorResponse,
  sendSuccessResponse,
  validateToken,
} from "../utils";
import { userRole } from "../types/enum";
import { sendEmail } from "../config/Smtp";

const register = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | any> => {
    const { email } = req.body;

    const userExists = await getUserByEmail(email);
    console.log("userExists", userExists);

    if (userExists && userExists.isVerified === true) {
      return sendErrorResponse(res, 400, "User already exists");
    }

    let user = userExists;

    if (userExists && userExists.isVerified === false) {
      user = await Models.User.findByIdAndUpdate(
        userExists._id,
        {
          $set: {
            ...req.body,
            isVerified: false,
            jti: generateRandomString(16),
          },
        },
        { new: true }
      );
    } else {
      user = new Models.User(req.body);
      const jti = generateRandomString(16);
      user.jti = jti;
      await user.save();
    }

    if (user != null) {
      const payload = {
        jti: user.jti,
        _id: user._id,
      };

      const token = generateToken(payload);

      const subject = "Email Verification";
      let baseUrl = process.env.BASE_URL || "";

      const text = `Please verify your email using the following link: ${baseUrl}/verify?token=${token}`;

      await sendEmail(email, subject, text, token, baseUrl);



      sendSuccessResponse(
        res,
        200,
        {
          token
        }
        ,
        "Verification link sent successfully"
      );
    } else {
      sendErrorResponse(res, 500, "Something went wrong, please try again");
    }
  }
);

// const verifyLink = asyncHandler(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void | any> => {
//     let token = req.query.token as string;

//     if (!token) {
//       return sendErrorResponse(res, 400, "Token is required");
//     }

//     const verify = validateToken(token);
//     console.log("Token verification result:", verify);

//     if (!verify) {
//       return sendErrorResponse(
//         res,
//         401,
//         "Invalid or expired token. Please try again."
//       );
//     }

//     const user = await getUserById(verify._id);

//     if (!user) {
//       return sendErrorResponse(res, 404, "User not found");
//     }

//     if (user.jti !== verify.jti) {
//       return sendErrorResponse(res, 401, "Invalid token");
//     }

//     await Models.User.findByIdAndUpdate(
//       verify._id,
//       { isVerified: true },
//       { new: true }
//     );

//     const data = {
//       userId: user._id,
//     };

//     return sendSuccessResponse(res, 200, data, "Email verification successful");
//   }
// );

const verifyLink = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | any> => {
    let token = req.query.token as string;

    if (!token) {
      return res.send(generateHtml("Token is required", false));
    }

    const verify = validateToken(token);
    console.log("Token verification result:", verify);

    if (!verify) {
      return res.send(
        generateHtml("Invalid or expired token. Please try again.", false)
      );
    }

    const user = await getUserById(verify._id);

    if (!user) {
      return res.send(generateHtml("User not found", false));
    }

    if (user.isVerified === true) {
      return res.send(generateHtml("Email is already verified", false));
    }

    if (user.jti !== verify.jti) {
      return res.send(generateHtml("Invalid token", false));
    }
    await Models.User.findByIdAndUpdate(
      verify._id,
      { isVerified: true },
      { new: true }
    );
    return res.send(generateHtml("Email verification successful!", true));
  }
);

const checkVerify = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | any> => {
    let token = req.query.token as string;

    if (!token) {
      return sendErrorResponse(res, 404, "Token is required");
    }
    const verify = validateToken(token);
    if (!verify) {
      return sendErrorResponse(res, 400, "Invalid token");
    }
    const user = await getUserById(verify._id);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    if (user.isVerified === true) {
      return sendSuccessResponse(res, 200, null, "You email has been verified")
    } else {
      return sendErrorResponse(res, 400, "Email is not verified yet");
    }
  });


const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | any> => {
    const { password, token } = req.body;
    if (!token) {
      return sendErrorResponse(res, 404, "Token is required");
    }

    const verify = validateToken(token);
    if (!verify) {
      return sendErrorResponse(res, 400, "Invalid token");
    }

    const user = await getUserById(verify._id);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    if (!user.isVerified) {
      return sendErrorResponse(res, 400, "Email is not verified yet");
    }

    user.password = await encryptPassword(password);
    await user.save();
    return sendSuccessResponse(res, 200, null, "Password has been created successfully");
  }
);

const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void | any> => {
    const { email, phone, password, country } = req.body;
    let user;
    if (email) {
      user = await getUserByEmail(email);
      if (!user) {
        return sendErrorResponse(res, 404, "User with this email not found");
      }
      if (!user.isVerified) {
        return sendErrorResponse(res, 400, "Email is not verified");
      }
    }
    if (phone && country) {
      user = await getUserByPhone(phone, country);
      if (!user) {
        return sendErrorResponse(res, 404, "User with this phone number not found");
      }
    }
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, "Invalid password");
    }
    const jti = generateRandomString(16);
    user.jti = jti;
    await user.save();

    let payload;
    if (user != null) {
      payload = {
        _id: user._id,
        jti: user.jti,
      };
      const token = generateToken(payload);
      return sendSuccessResponse(res, 200, { email: user.email, phone: user.phone, role: user.role, token }, "Login successful");
    }
  });


const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void | any> => {
    const { fullName, email, phone, country, language, profileImage, businessName, organization_number, address, national_number } = req.body;

    const userId = req.userId;
    const user = await getUserById(userId);

    if (!user) return sendErrorResponse(res, 404, "User not found");

    if (fullName) user.fullName = fullName;

    if (national_number) user.national_number = national_number;

    if (businessName) user.businessName = businessName;

    if (organization_number) user.organization_number = organization_number;

    if (address) user.address = address;

    if (email && email !== user.email) {
      const existingUser = await getUserByEmail(email);
      if (existingUser && existingUser.isVerified) {
        return sendErrorResponse(res, 400, "Email already exists");
      }
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const existingUser = await getUserByPhone(phone, country);
      if (existingUser && existingUser.isVerified) {
        return sendErrorResponse(res, 400, "Phone number already exists");
      }
      user.phone = phone;
    }

    if (language) user.language = language;

    if (profileImage) user.profileImage = profileImage;

    await user.save();

    return sendSuccessResponse(res, 200, null, "Profile updated successfully");
  }
);


const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    if (oldPassword === newPassword) {
      return sendErrorResponse(res, 400, "New password should not be same as old password");
    }
    const user = await getUserById(userId);
    if (!user) return sendErrorResponse(res, 404, "User not found");
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, "Invalid old password");
    }
    user.password = await encryptPassword(newPassword);
    await user.save();
    return sendSuccessResponse(res, 200, null, "Password has been changed successfully");
  });


const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userId = req.userId;
    const user = await getUserById(userId);
    if (!user) return sendErrorResponse(res, 404, "User not found");
    user.jti = null;
    user.deviceToken = null;
    user.deviceType = null;
    await user.save();
    return sendSuccessResponse(res, 200, null, "User logged out successfully");
  });









const generateHtml = (message: string, success: boolean) => {
  const status = success ? "success" : "error";
  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .message { font-size: 1.2em; margin-top: 20px; }
            .${status} { color: ${status === "success" ? "green" : "red"}; }
          </style>
        </head>
        <body>
          <h1>Email Verification</h1>
          <p class="message ${status}">${message}</p>
        </body>
      </html>
    `;
};

const User = {
  register,
  verifyLink,
  checkVerify,
  updatePassword,
  login,
  updateProfile,
  changePassword,
  logout
};

export default User;
