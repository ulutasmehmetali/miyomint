export interface Product {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  savings?: string;
  image: string;
  quantity?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CartItem extends Product {
  quantity: number;
}
