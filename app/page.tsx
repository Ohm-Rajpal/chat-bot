'use client';

import Image from "next/image";
import React, {useState, useRef, useEffect} from "react";
import {Container, Box, TextField, IconButton, Typography, Paper, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {PictureAsPdf} from "@mui/icons-material";

export default function Home() {

  // create Message type
  type Message = {
    role: string;
    content: string;
  };

  // state vars
  const [messages, setMessages] = useState<Array<Message>>([
    {
      role: "assistant",
      content: 'Hello! I am an AI assistant who is an expert at privacy policy. How can I help you today?'}
  ]);
  const [userMessage, setUserMessage] = useState<string>('');

  const sendMessage = async (): Promise<void> => {
    if (!userMessage.trim()) return; // Don't send empty messages

    // Reset the user input and update the message state with the new user message
    setUserMessage('');
    setMessages((messages: Message[]) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    try {
      // Send a POST request to the API with the current conversation
      const response: Response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Reading the response as a stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text: string = decoder.decode(value, { stream: true });

          setMessages((messages: Message[]) => {
            const lastMessage = messages[messages.length - 1];
            const otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ];
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);

      // Handle any errors by updating the assistant's message
      setMessages((messages: Message[]) => [
        ...messages,
        {
          role: 'assistant',
          content: "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
  };

  const handleEnterButton = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await sendMessage(); // Calls the sendMessage function
    }
  }

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer && chatContainer.scrollHeight > chatContainer.clientHeight) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
      <Container maxWidth="lg" sx={{ border: '5px solid #c1d8f0',height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#e1f1fd', padding: 2, borderRadius: '30px'}}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 2, color: '#4663ac' }}>Chatbot</Typography>
        <Paper elevation={3} sx={{ border: '5px solid #c1d8f0', flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2, backgroundColor: '#c8d9ed' }}>
          <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2, maxHeight: '75vh'}}>
            {/* Chat messages will be displayed here */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: '10px'}} >
              {/* Mapping logic */}
              {
                messages.map(({ role, content }, index) => (
                    <Paper
                        sx={{
                          padding: 1,
                          backgroundColor: role === 'user' ? '#c1d8f0' : '#d2deeb',
                          borderRadius: 2,
                          alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
                          justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                        key={index}
                    >
                      <Typography>{role === 'user' ? `User: ${content}` : `Bot: ${content}`}</Typography>
                    </Paper>
                ))
              }
            </Box>
          </Box>
          <Box component="form" sx={{ display: 'flex', gap: 1 }}>
            <TextField
                autoComplete="off"
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleEnterButton}
            />
            <Button
                color="primary"
                sx={{ backgroundColor: '#b4c9e0', '&:hover': { backgroundColor: '#f5c6ef' }}}
                onClick={ sendMessage }
            >
              <PictureAsPdf />
            </Button>
            <Button
                color="primary"
                sx={{ backgroundColor: '#b4c9e0', '&:hover': { backgroundColor: '#f5c6ef' }}}
                onClick={ sendMessage }
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Container>
  );
}
