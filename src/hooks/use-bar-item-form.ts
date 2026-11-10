import { useState } from "react";
import { BAR_CATEGORIES } from "@/lib/constants";
import { useCreateBarItem } from "@/hooks/use-bar";

export function useBarItemForm(onClose: () => void) {
  const createItem = useCreateBarItem();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<string>(BAR_CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setCode("");
    setCategory(BAR_CATEGORIES[0]);
    setPrice("");
    setStock("");
    setImageUrl(null);
  };

  const submit = () => {
    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim() || Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
      return;
    }

    createItem.mutate(
      {
        name: name.trim(),
        code: code.trim() || null,
        category,
        price: priceNum,
        stock: stockNum,
        imageUrl,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return {
    name,
    setName,
    code,
    setCode,
    category,
    setCategory,
    price,
    setPrice,
    stock,
    setStock,
    imageUrl,
    setImageUrl,
    submit,
    isPending: createItem.isPending,
    isError: createItem.isError,
  };
}
