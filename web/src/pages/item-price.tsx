import React from "react";

export default function ItemPrice(): React.ReactElement {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Item Price</h1>
          <p className="text-muted-foreground">
            Search for a item price
          </p>
        </div>
      </div>
    </div>
  );
}
