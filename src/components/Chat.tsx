import React, { useState, useEffect } from 'react'
import * as SynapseReactClient from 'synapse-react-client'
import { ExternalChatProvider } from '../types'

interface ChatProps {
  chatProvider?: ExternalChatProvider
  sessionId?: string
  onSessionCreate?: (sessionId: string) => void
  enableHistory?: boolean
  placeholder?: string
  agentRegistrationId?: string
  chatbotName?: string
  hideTitle?: boolean
}

const Chat: React.FC<ChatProps> = ({
  chatProvider,
  sessionId: initialSessionId,
  onSessionCreate,
  enableHistory = true,
  placeholder = 'Type your message...',
  agentRegistrationId,
  chatbotName = 'Assistant',
  hideTitle = false,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [error, setError] = useState<string | null>(null)

  // Initialize session
  useEffect(() => {
    const initializeChat = async () => {
      if (chatProvider && !sessionId) {
        try {
          const newSessionId = await chatProvider.createSession()
          setSessionId(newSessionId)
          if (onSessionCreate) {
            onSessionCreate(newSessionId)
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat')
        }
      }
    }

    initializeChat()
  }, [chatProvider, sessionId, onSessionCreate])

  if (!chatProvider) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          {!hideTitle && <h3>Chat</h3>}
        </div>
        <div className="chat-body">
          <p>No chat provider configured</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          {!hideTitle && <h3>Chat</h3>}
        </div>
        <div className="chat-error" style={{ color: 'red', padding: '10px' }}>
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container" style={{ height: '100%' }}>
      <SynapseReactClient.SynapseComponents.SynapseChat
        initialMessage={placeholder}
        agentRegistrationId={agentRegistrationId}
        chatbotName={chatbotName}
        hideTitle={hideTitle}
      />
    </div>
  )
}

export default Chat