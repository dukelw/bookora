"use client";

import { useState, useEffect } from "react";
import { TextInput } from "flowbite-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // call search khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery.trim() !== "") {
      console.log("Searching:", debouncedQuery);
      // chỗ này bà gọi API search luôn
    }
  }, [debouncedQuery]);

  return (
    <div className="flex gap-2 items-center w-full min-w-[280px]">
      <TextInput
        type="text"
        placeholder="Type your search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
    </div>
  );
};

export default SearchBar;
