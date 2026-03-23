"use client";

import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const Board = () => {
  const [laneTitle, setLaneTitle] = useState("");

  const [lanes, setLanes] = useState(() => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("board");
    return data ? JSON.parse(data) : [];
  });

  // 🔄 Persist data
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("board", JSON.stringify(lanes));
    }
  }, [lanes]);

  // ➕ Add Lane
  const addLane = () => {
    if (!laneTitle.trim()) return;

    const newLane = {
      id: crypto.randomUUID(),
      title: laneTitle,
      cards: [],
    };

    setLanes((prev) => [...prev, newLane]);
    setLaneTitle("");
  };

  // ❌ Delete Lane
  const deleteLane = (laneId) => {
    setLanes((prev) =>
      prev.filter((lane) => lane.id !== laneId)
    );
  };

  // ➕ Add Card
  const addCard = (laneId, text) => {
    if (!text.trim()) return;

    const updated = lanes.map((lane) => {
      if (lane.id === laneId) {
        return {
          ...lane,
          cards: [
            ...lane.cards,
            { id: crypto.randomUUID(), text },
          ],
        };
      }
      return lane;
    });

    setLanes(updated);
  };

  // Drag End Handler
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    //Lane Reorder
    if (type === "LANE") {
      const updatedLanes = [...lanes];

      const [movedLane] = updatedLanes.splice(source.index, 1);
      updatedLanes.splice(destination.index, 0, movedLane);

      setLanes(updatedLanes);
      return;
    }

    //Card Movement

    const sourceLaneIndex = lanes.findIndex(
      (lane) => lane.id === source.droppableId
    );

    const destLaneIndex = lanes.findIndex(
      (lane) => lane.id === destination.droppableId
    );

    const sourceLane = lanes[sourceLaneIndex];
    const destLane = lanes[destLaneIndex];

    const sourceCards = [...sourceLane.cards];
    const [movedCard] = sourceCards.splice(source.index, 1);

    // Same Lane
    if (sourceLaneIndex === destLaneIndex) {
      sourceCards.splice(destination.index, 0, movedCard);

      const updatedLanes = [...lanes];
      updatedLanes[sourceLaneIndex] = {
        ...sourceLane,
        cards: sourceCards,
      };

      setLanes(updatedLanes);
    } else {
      // Cross Lane

      const destCards = [...destLane.cards];
      destCards.splice(destination.index, 0, movedCard);

      const updatedLanes = [...lanes];

      updatedLanes[sourceLaneIndex] = {
        ...sourceLane,
        cards: sourceCards,
      };

      updatedLanes[destLaneIndex] = {
        ...destLane,
        cards: destCards,
      };

      setLanes(updatedLanes);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-6">

        {/* ➕ Add Lane */}
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg w-fit shadow-sm mb-6">
          <input
            type="text"
            placeholder="Enter lane title"
            value={laneTitle}
            onChange={(e) => setLaneTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLane()}
            className="border border-gray-300 bg-white text-gray-800 placeholder-gray-400 text-sm px-3 py-1.5 rounded-md outline-none focus:ring-2 focus:ring-blue-300 transition w-44"
          />

          <button
            onClick={addLane}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition"
          >
            + Add Lane
          </button>
        </div>

        {/* Lanes */}
        <Droppable
          droppableId="lanes"
          direction="horizontal"
          type="LANE"
        >
          {(provided) => (
            <div
              className="flex gap-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lanes.map((lane, index) => (
                <Draggable
                  key={lane.id}
                  draggableId={lane.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-200 p-4 rounded w-64"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-black">
                          {lane.title}
                        </h2>

                        <button
                          onClick={() => deleteLane(lane.id)}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      </div>

                      {/* 📦 Cards */}
                      <Droppable droppableId={lane.id} type="CARD">
                        {(provided) => (
                          <div
                            className="mt-3"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {lane.cards.map((card, index) => (
                              <Draggable
                                key={card.id}
                                draggableId={card.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white text-black p-2 rounded shadow mb-2"
                                  >
                                    {card.text}
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* ➕ Add Card */}
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Add card"
                          className="border p-1 w-full rounded text-black"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addCard(lane.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>

                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>

      </div>
    </DragDropContext>
  );
};

export default Board;