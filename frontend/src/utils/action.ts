import Comment from "@/interfaces/Comment";

export const getAllReplies = (list: Comment[], parentId: string): Comment[] => {
  const direct = list.filter((c) => c.parentComment?._id === parentId);
  let all: Comment[] = [...direct];
  direct.forEach((c) => {
    all = all.concat(getAllReplies(list, c._id));
  });
  return all;
};
