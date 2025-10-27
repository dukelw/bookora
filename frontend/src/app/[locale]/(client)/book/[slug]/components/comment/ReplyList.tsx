"use client";
import React from "react";
import Comment from "@/interfaces/Comment";
import CommentItem from "./CommentItem";

interface ReplyListProps {
  replies: Comment[];
  userId?: string;
  openMenuId: string | null;
  editContent: string;
  editingId: string | null;
  onLike: (id: string) => void;
  onReply: (c: Comment) => void;
  onEdit: (id: string) => void;
  onEditChange: (v: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  onToggleMenu: (id: string) => void;
}

export default function ReplyList({
  replies,
  userId,
  openMenuId,
  editContent,
  editingId,
  onLike,
  onReply,
  onEdit,
  onEditChange,
  onEditCancel,
  onDelete,
  onToggleMenu,
}: ReplyListProps) {
  if (!replies?.length) return null;
  return (
    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
      {replies.map((r) => (
        <CommentItem
          key={r._id}
          comment={r}
          userId={userId}
          isEditing={editingId === r._id}
          editContent={editContent}
          openMenuId={openMenuId}
          onLike={onLike}
          onReply={onReply}
          onEdit={onEdit}
          onEditChange={onEditChange}
          onEditCancel={onEditCancel}
          onDelete={onDelete}
          onToggleMenu={onToggleMenu}
          isChild
        />
      ))}
    </div>
  );
}