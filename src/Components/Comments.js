import React, { useState, useEffect } from "react";
import { useWallet } from "../WalletContext";
import {
  VStack,
  Box,
  Text,
  Input,
  Button,
  Divider,
  Avatar,
  HStack,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Textarea,
  Select,
  Flex,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  ButtonGroup,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Icon,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  EditIcon,
  DeleteIcon,
  WarningIcon,
  ChevronUpIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import axios from "axios";

const COMMENTS_PER_PAGE = 10;
const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_LIKED: "most_liked",
  MOST_DISCUSSED: "most_discussed",
};

const Comments = ({ onChainId }) => {
  console.log("Comments component received onChainId:", onChainId);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const { userData } = useWallet();
  const toast = useToast();
  const API_URL = process.env.REACT_APP_API_URL;
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchComments = async (page = 1, sort = sortBy) => {
    setIsLoading(true);
    console.log("Fetching comments with params:", {
      onChainId,
      page,
      limit: COMMENTS_PER_PAGE,
      sort,
    });

    try {
      const url = `${API_URL}/api/comments`;

      const response = await axios.get(url, {
        params: {
          onChainId,
          page,
          limit: COMMENTS_PER_PAGE,
          sort,
        },
      });

      console.log("Response from server:", response.data);

      const fetchedComments = response.data.comments || [];
      setComments(fetchedComments);

      const totalComments = response.data.total || 0;
      setTotalPages(Math.ceil(totalComments / COMMENTS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching comments:", error);
      console.log("Attempted URL:", error.config?.url);
      toast({
        title: "Error fetching comments",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (onChainId) {
      fetchComments(currentPage, sortBy);
    }
  }, [onChainId, currentPage, sortBy]);

  const handlePostComment = async (isReply = false) => {
    try {
      if (!userData?.profile?.stxAddress?.mainnet) {
        toast({
          title: "Please connect your wallet",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const content = isReply ? replyText : newComment;

      if (!content || !content.trim()) {
        toast({
          title: "Comment cannot be empty",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const payload = {
        onChainId,
        walletAddress: userData.profile.stxAddress.mainnet,
        content: content.trim(),
      };

      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/comments`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (isReply) {
        setReplyTo(null);
        setReplyText("");
      } else {
        setNewComment("");
      }

      fetchComments(currentPage, sortBy);
      toast({
        title: isReply
          ? "Reply posted successfully"
          : "Comment posted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error posting comment",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await axios.patch(`${API_URL}/api/comments/${commentId}`, {
        content: editText.trim(),
        walletAddress: userData.profile.stxAddress.mainnet,
      });

      setEditingComment(null);
      setEditText("");
      fetchComments(currentPage, sortBy);

      toast({
        title: "Comment updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating comment",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/comments/${commentToDelete}`, {
        data: { walletAddress: userData.profile.stxAddress.mainnet },
      });

      closeDeleteModal();
      setCommentToDelete(null);
      fetchComments(currentPage, sortBy);

      toast({
        title: "Comment deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleVote = async (commentId, isUpvote) => {
    if (!userData?.profile?.stxAddress?.mainnet) {
      toast({
        title: "Please connect your wallet",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/vote`,
        {
          walletAddress: userData.profile.stxAddress.mainnet,
          vote: isUpvote ? 1 : -1,
        }
      );

      fetchComments(currentPage, sortBy);
    } catch (error) {
      toast({
        title: "Error voting",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderComment = (comment, isReply = false) => (
    <Box
      key={comment._id}
      p={4}
      bg="rgba(0, 0, 0, 0.2)"
      borderRadius="md"
      borderLeft={isReply ? "2px solid" : "none"}
      borderColor={isReply ? "blue.200" : "none"}
      ml={isReply ? 8 : 0}
    >
      <HStack spacing={3} mb={2} justify="space-between">
        <HStack>
          <Avatar size="sm" name={formatWalletAddress(comment.walletAddress)} />
          <Text fontWeight="bold" color="white">
            {formatWalletAddress(comment.walletAddress)}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.600">
            {formatTimestamp(comment.createdAt)}
          </Text>
        </HStack>

        {userData?.profile?.stxAddress?.mainnet === comment.walletAddress && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="ghost"
              size="sm"
              color="white"
            />
            <MenuList bg="gray.800">
              <MenuItem
                icon={<EditIcon />}
                onClick={() => {
                  setEditingComment(comment._id);
                  setEditText(comment.content);
                }}
                color="white"
              >
                Edit
              </MenuItem>
              <MenuItem
                icon={<DeleteIcon />}
                color="red.400"
                onClick={() => {
                  setCommentToDelete(comment._id);
                  openDeleteModal();
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>

      {editingComment === comment._id ? (
        <VStack spacing={2}>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Edit your comment..."
            bg="rgba(0, 0, 0, 0.2)"
            color="white"
            borderColor="whiteAlpha.300"
          />
          <HStack spacing={2}>
            <Button size="sm" onClick={() => handleEditComment(comment._id)}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditingComment(null);
                setEditText("");
              }}
              color="white"
            >
              Cancel
            </Button>
          </HStack>
        </VStack>
      ) : (
        <>
          <Text ml={10} color="white">
            {comment.content}
          </Text>
          <HStack mt={2} spacing={4}>
            <ButtonGroup size="sm" isAttached variant="outline">
              <IconButton
                icon={<TriangleUpIcon />}
                onClick={() => handleVote(comment._id, true)}
                colorScheme={comment.userVote === 1 ? "blue" : "whiteAlpha"}
              />
              <Button color="white">{comment.votes || 0}</Button>
              <IconButton
                icon={<TriangleDownIcon />}
                onClick={() => handleVote(comment._id, false)}
                colorScheme={comment.userVote === -1 ? "red" : "whiteAlpha"}
              />
            </ButtonGroup>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyTo(comment._id)}
              color="white"
            >
              Reply
            </Button>
          </HStack>
        </>
      )}

      {replyTo === comment._id && (
        <Box mt={4} ml={10}>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            size="sm"
            bg="rgba(0, 0, 0, 0.2)"
            color="white"
            borderColor="whiteAlpha.300"
          />
          <HStack mt={2}>
            <Button size="sm" onClick={() => handlePostComment(true)}>
              Post Reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setReplyTo(null);
                setReplyText("");
              }}
              color="white"
            >
              Cancel
            </Button>
          </HStack>
        </Box>
      )}

      {comment.replies &&
        comment.replies.map((reply) => renderComment(reply, true))}
    </Box>
  );

  return (
    <Box
      bg="rgba(255, 255, 255, 0.6)" // Soft gray with 50% transparency
      backdropFilter="blur(10px)" // Add blur effect to improve readability
      borderRadius={5}
    >
      <VStack spacing={4} align="stretch">
        <HStack mb={6}>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={!userData?.profile}
            bg="rgba(255, 255, 255, 0.1)"
            borderColor="transparent"
            color="black"
            _placeholder={{ color: "black" }}
          />
          <Button
            onClick={() => handlePostComment(false)}
            bg="#3182CE"
            color="white"
            _hover={{ bg: "#2B6CB0" }}
            isLoading={isLoading}
            disabled={!userData?.profile || !newComment.trim()}
          >
            Post
          </Button>
        </HStack>

        {isLoading ? (
          <Flex justify="center" p={4}>
            <Spinner color="white" />
          </Flex>
        ) : comments.length === 0 ? (
          <Text color="black">No comments yet. Be the first to comment!</Text>
        ) : (
          <>
            {comments.map((comment) => renderComment(comment))}
            <HStack justify="center" spacing={2} mt={4}>
              <Button
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text color="white">{`Page ${currentPage} of ${totalPages}`}</Text>
              <Button
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
          </>
        )}

        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <ModalOverlay />
          <ModalContent bg="gray.800">
            <ModalHeader color="white">Delete Comment</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody color="white">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={handleDeleteComment}>
                Delete
              </Button>
              <Button variant="ghost" onClick={closeDeleteModal} color="white">
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default Comments;
