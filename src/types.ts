export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isStreaming?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'Appointment Scheduled' | 'Processing' | 'Agent Dispatched' | 'Delivered';
    estimatedDelivery: string;
}

export interface DesignOptions {
    metal: string;
    stone: string;
    style: string;
    engraving: string;
}