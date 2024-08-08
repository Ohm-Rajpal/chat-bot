'use client';

import Image from "next/image";
import { useState } from "react";
import { Container, Box, TextField, IconButton, Typography, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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

  const [message, setMessage] = useState<string>('');
  const [userMessages, setUserMessages] = useState<Array<string>>(['']);

  return (
      <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#e1f1fd', padding: 2, borderRadius: '30px'}}>
        <Typography variant="h4" align="center" sx={{ marginBottom: 2, color: '#4663ac' }}>Chatbot</Typography>
        <Paper elevation={3} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2, backgroundColor: '#c8d9ed' }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', marginBottom: 2 }}>
            {/* Chat messages will be displayed here */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ alignSelf: 'flex-end', padding: 1, backgroundColor: '#c1d8f0', borderRadius: 2 }}>
                <Typography>User: Hello!</Typography>
              </Paper>
              <Paper sx={{ alignSelf: 'flex-start', padding: 1, backgroundColor: '#d2deeb', borderRadius: 2 }}>
                <Typography>Bot: Hi there!</Typography>
              </Paper>
            </Box>
          </Box>
          <Box component="form" sx={{ display: 'flex', gap: 1 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <IconButton color="primary" sx={{ backgroundColor: '#4663ac', '&:hover': { backgroundColor: '#c1d8f0' } }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Container>
  );
}
