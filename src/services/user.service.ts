import { ObjectId } from "mongoose";
import Models from "../models";



export const getUserByEmail = async (email: string) => {
    const user = await Models.User.findOne({ email })
    return user;
}

export const getUserById = async (id: string | ObjectId | undefined) => {
    const user = await Models.User.findById(id)
    return user;
}

export const getUserByPhone = async (phone: string, country: string) => {
    const user = await Models.User.findOne({ phone, country });
    return user;
}
