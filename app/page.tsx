'use client';

import Image from "next/image";
import React, { useState } from "react";
import {Container, Box, TextField, IconButton, Typography, Paper, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function Home() {

  // create Message type
  type Message = {
    role: string;
    content: string;
  };

  // state vars
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [userMessage, setUserMessage] = useState<string>('');

  const sendMessage = async () => {
    setMessages((messages) => [
        ...messages,
      {role: "user", content: userMessage},
      {role: "assistant", content: ''}
      ])

    setUserMessage(''); // reset the user message

    // Post request

  }

  const handleEnterButton = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await sendMessage(); // Calls the sendMessage function
    }
  }


  return (
      <Container maxWidth="lg" sx={{ border: '5px solid #c1d8f0',height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#e1f1fd', padding: 2, borderRadius: '30px'}}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 2, color: '#4663ac' }}>Chatbot</Typography>
        <Paper elevation={3} sx={{ border: '5px solid #c1d8f0', flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2, backgroundColor: '#c8d9ed' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
            {/* Chat messages will be displayed here */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Mapping logic */}
              {
                messages.map(({ role, content }, index) => (
                    <Paper
                        sx={{
                          padding: 1,
                          backgroundColor: role === 'user' ? '#c1d8f0' : '#d2deeb',
                          borderRadius: 2,
                          alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
                          justifyContent: role === 'user' ? 'flex-end' : 'flex-start'
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
                sx={{ backgroundColor: '#4663ac', '&:hover': { backgroundColor: '#c1d8f0' }}}
                onClick={ sendMessage }

            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Container>
  );
}
