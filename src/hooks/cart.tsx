import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoaded = await AsyncStorage.getItem('@GoMarket:products');

      if (productsLoaded) {
        setProducts(JSON.parse(productsLoaded));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productFound = products.find(item => item.id === product.id);

      if (productFound) {
        const productsMapped = products.map(item => {
          return item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });

        setProducts(productsMapped);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(productsMapped),
        );

        return;
      }

      setProducts([...products, { ...product, quantity: 1 }]);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify([...products, { ...product, quantity: 1 }]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productFound = products.find(item => item.id === id);

      if (productFound) {
        const productsMapped = products.map(item => {
          return item.id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });

        setProducts(productsMapped);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(productsMapped),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productFound = products.find(item => item.id === id);

      if (productFound && productFound.quantity > 1) {
        const productsMapped = products.map(item => {
          return item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item;
        });

        setProducts(productsMapped);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(productsMapped),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
