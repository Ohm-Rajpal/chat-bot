'use client';

import Image from "next/image";
import { useState } from "react";

export default function Home() {

  // create Message type
  type Message = {
    role: string;
    content: string;
  };

  // state vars
  const [messages, setMessages] = useState<Message>({
    role: 'professional assistant',
    content: 'Hello! I am an AI who can help you analyze and evaluate university privacy policies. How can I assist you today?'
  });


  return (
    <h1>test</h1>
  );
}
