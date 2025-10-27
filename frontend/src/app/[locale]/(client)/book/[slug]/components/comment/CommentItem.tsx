"use client";
import React from "react";
import dayjs from "dayjs";
import Comment from "@/interfaces/Comment";
import CommentMenu from "./CommentMenu";
import EditComment from "./EditComment";
import { useTranslations } from "use-intl";

interface CommentItemProps {
  comment: Comment;
  userId?: string;
  isEditing: boolean;
  editContent: string;
  openMenuId: string | null;
  onLike: (id: string) => void;
  onReply: (c: Comment) => void;
  onEdit: (id: string) => void;
  onEditChange: (v: string) => void;
  onEditCancel: () => void;
  onDelete: (id: string) => void;
  onToggleMenu: (id: string) => void;
  isChild?: boolean;
}

export default function CommentItem({
  comment,
  userId,
  isEditing,
  editContent,
  openMenuId,
  onLike,
  onReply,
  onEdit,
  onEditChange,
  onEditCancel,
  onDelete,
  onToggleMenu,
  isChild = false,
}: CommentItemProps) {
  const isLiked = comment.likes?.includes(userId || "");
  const isOwner = userId === comment.user?._id;
  const t = useTranslations("comment");

  return (
    <div className={`flex gap-3 ${isChild ? "" : "mb-6"}`}>
      <img
        src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=random`}
        alt={comment.user?.name}
        className={`${isChild ? "w-9 h-9" : "w-10 h-10"} rounded-full object-cover shrink-0`}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-gray-900 ${isChild ? "text-sm" : ""}`}>{comment.user?.name || "Bookholic"}</span>
            <span className={`${isChild ? "text-xs" : "text-sm"} text-gray-500`}>{dayjs(comment.createdAt).fromNow()}</span>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => onToggleMenu(openMenuId === comment._id ? "" : comment._id)}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full transition"
              >
                <svg className={`${isChild ? "w-4 h-4" : "w-5 h-5"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {openMenuId === comment._id && (
                <CommentMenu
                  onEdit={() => onEdit(comment._id)}
                  onDelete={() => onDelete(comment._id)}
                />
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <EditComment
            value={editContent}
            onChange={onEditChange}
            onSave={() => onEdit(comment._id)}
            onCancel={onEditCancel}
            isChild={isChild}
          />
        ) : (
          <p className={`text-gray-900 ${isChild ? "text-sm" : "text-base"} leading-relaxed mt-1`}>
            {isChild && comment.parentComment && (
                <span className="font-medium text-blue-600 mr-1">
                    @{comment.user.name}
                </span>
            )}
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onLike(comment._id)}
            className={`flex items-center gap-1 transition ${isLiked ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`}
          >
            <svg className={`${ isChild ? "w-4 h-4" : "w-5 h-5" }`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className={`${isChild ? "text-xs" : "text-sm"} font-medium`}>{comment.likes.length}</span>
          </button>
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
          >
            <svg className={`${ isChild ?  "w-4 h-4" : "w-5 h-5" }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span className={`${isChild ? "text-xs" : "text-sm"} font-medium`}>{t("reply")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}