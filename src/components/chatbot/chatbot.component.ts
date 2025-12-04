
import { Component, ChangeDetectionStrategy, signal, ViewChild, ElementRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { AiMetaService } from '../../services/ai-meta.service';
import { AuthService } from '../../auth/auth.service';
import { ChatMessage } from '../../types';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  private geminiService = inject(GeminiService);
  private aiMetaService = inject(AiMetaService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([
    { sender: 'bot', text: "Greetings! I am Mr. Ahmed, your personal assistant at Madni Jewellers. How may I help you discover the perfect piece today?" }
  ]);
  userInput = signal('');
  isLoading = signal(false);
  isVoiceOn = signal(false);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor() {
    effect(() => {
      if (this.messages() && this.isOpen()) {
        this.scrollToBottom();
      }
    });

    // Personalize greeting when chat opens if user is logged in
    effect(() => {
        if (this.isOpen() && this.authService.currentUser() && this.messages().length === 1) {
            this.generatePersonalGreeting();
        }
    }, { allowSignalWrites: true });
  }

  private async generatePersonalGreeting() {
    const user = this.authService.currentUser();
    const context = this.aiMetaService.getUserContextDescription();
    
    // Simple client-side personalization to avoid extra API call latency on open
    if (context.includes('interested in')) {
         this.messages.update(m => [{ 
             sender: 'bot', 
             text: `Welcome back, ${user}. I noticed your interest in our exquisite collection. How may I assist you further?` 
         }]);
    }
  }

  toggleChat(): void {
    this.isOpen.update(open => !open);
  }
  
  toggleVoice(): void {
    this.isVoiceOn.update(v => !v);
  }

  async sendMessage(): Promise<void> {
    const messageText = this.userInput().trim();
    if (!messageText || this.isLoading()) return;

    this.messages.update(m => [...m, { sender: 'user', text: messageText }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    this.messages.update(m => [...m, { sender: 'bot', text: '', isStreaming: true }]);

    try {
      const streamReader = await this.geminiService.sendChatMessage(messageText, this.messages());
      
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: readerDone } = await streamReader.read();
        done = readerDone;
        if (value) {
           fullResponse += value;
           this.messages.update(msgs => {
              const lastMsg = msgs[msgs.length - 1];
              lastMsg.text += value;
              return [...msgs];
           });
           this.scrollToBottom();
        }
      }
      
      // Update meta with summary (simple implementation: just store last topic)
      this.aiMetaService.updateConversationSummary(messageText.substring(0, 50) + "...");

    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.update(m => {
          const lastMsg = m[m.length - 1];
          lastMsg.text = 'My apologies, I seem to be having trouble connecting. Please try again shortly.';
          return [...m];
      });
    } finally {
        this.messages.update(msgs => {
            const lastMsg = msgs[msgs.length - 1];
            if(lastMsg) lastMsg.isStreaming = false;
            return [...msgs];
        });
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 10);
  }
}
