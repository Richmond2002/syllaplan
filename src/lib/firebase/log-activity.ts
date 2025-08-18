import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./client";

const db = getFirestore(app);

export async function logActivity(user: string, action: string, subject: string) {
    try {
        await addDoc(collection(db, "activities"), {
            user,
            action,
            subject,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error logging activity: ", error);
        // Optionally, you could re-throw the error or handle it in another way
    }
}
