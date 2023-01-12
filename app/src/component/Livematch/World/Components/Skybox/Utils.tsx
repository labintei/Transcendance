import React from "react";

export default function generateRandomFloatInRange(min:any, max:any) {
    return (Math.random() * (max - min + 1)) + min;
}