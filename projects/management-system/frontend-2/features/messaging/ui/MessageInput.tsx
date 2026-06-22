import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import {
  ImageIcon,
  Link2,
  Loader2,
  Mic,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { API_URL } from "@/constants";
import { useChatFiles, useFileUpload, useIsMobile } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";

declare global {
  interface Window {
    lamejs?: unknown;
  }
}

interface MessageInputProps {
  onSend?: (message: {
    body: string;
    file_url?: string;
    file_path?: string;
  }) => void;
  onTyping?: (isTyping: boolean) => void;
}

// Helper to make file URLs absolute
const makeAbsoluteUrl = (url: string | undefined) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return API_URL.replace(/\/$/, "") + url;
};

export default function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    file: File | Blob;
    url?: string;
    key?: string;
    type: string;
    name: string;
    size: number;
  } | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lameJsLoaded, setLameJsLoaded] = useState(false);
  const { uploadFile } = useChatFiles();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);
  const isMobile = useIsMobile();

  // Mobile keyboard and viewport handling
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.innerHeight;

    let isKeyboardOpen = false;

    const restoreViewportAndPosition = () => {
      // Multiple strategies to ensure proper restoration
      setTimeout(() => {
        // Force scroll to top
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        // Reset any transforms or positioning
        if (containerRef.current) {
          containerRef.current.style.transform = "";
          containerRef.current.style.position = "";
          containerRef.current.style.bottom = "";
        }
      }, 50);

      // Secondary restoration attempt
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }

        // Final scroll to ensure proper positioning
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);

      // Final restoration attempt
      setTimeout(() => {
        window.scrollTo(0, 0);
        if (document.body.style.height) {
          document.body.style.height = "";
        }
        if (document.documentElement.style.height) {
          document.documentElement.style.height = "";
        }
      }, 400);
    };

    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;

      // Keyboard is considered open if viewport height decreased significantly (>150px)
      const keyboardThreshold = 150;
      const wasKeyboardOpen = isKeyboardOpen;
      isKeyboardOpen = heightDifference > keyboardThreshold;

      // If keyboard just closed, restore viewport and position
      if (wasKeyboardOpen && !isKeyboardOpen) {
        restoreViewportAndPosition();
      }
    };

    const handleOrientationChange = () => {
      // Update initial height on orientation change
      setTimeout(() => {
        initialViewportHeight = window.innerHeight;
        isKeyboardOpen = false;
      }, 500);
    };

    // Use visual viewport API if available (better for keyboard detection)
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        const wasKeyboardOpen = isKeyboardOpen;
        const currentViewportHeight = window.visualViewport!.height;
        isKeyboardOpen = currentViewportHeight < initialViewportHeight * 0.75;

        if (wasKeyboardOpen && !isKeyboardOpen) {
          // Keyboard just closed - restore everything
          restoreViewportAndPosition();
        }
      };

      window.visualViewport.addEventListener(
        "resize",
        handleVisualViewportChange
      );

      return () => {
        window.visualViewport?.removeEventListener(
          "resize",
          handleVisualViewportChange
        );
      };
    } else {
      // Fallback for browsers without visual viewport API
      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("orientationchange", handleOrientationChange);

      return () => {
        window.removeEventListener("resize", handleViewportChange);
        window.removeEventListener(
          "orientationchange",
          handleOrientationChange
        );
      };
    }
  }, [isMobile]);

  // Handle input focus for mobile
  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      // Ensure input is focused
      inputRef.current.focus();

      // On mobile, scroll input into view after a short delay
      if (isMobile) {
        setTimeout(() => {
          if (inputRef.current && containerRef.current) {
            inputRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      }
    }
  }, [isMobile]);

  // Auto-focus on mobile when component mounts or when tapped
  useEffect(() => {
    if (!isMobile || !inputRef.current) return;

    // Add touch event listener for better mobile responsiveness
    const handleTouchStart = () => {
      handleInputFocus();
    };

    const inputElem = inputRef.current;
    inputElem.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      inputElem.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isMobile, handleInputFocus]);

  const {
    error: imageError,
    fileInputRef: imageInputRef,
    handleFileChange: handleImageChange,
    resetFile: resetImageFile,
  } = useFileUpload({
    onFileSelect: async (file) => {
      if (file) {
        setUploading(true);
        try {
          const res = await uploadFile.mutateAsync(file);
          const fileUrl = makeAbsoluteUrl(res?.file_url || res?.url);
          const fileKey = res?.file_key;
          setAttachment({
            file,
            url: fileUrl,
            key: fileKey,
            type: "image",
            name: file.name,
            size: file.size,
          });
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    },
  });

  const {
    error: docError,
    fileInputRef: fileInputRef,
    handleFileChange: handleDocChange,
    resetFile: resetDocFile,
  } = useFileUpload({
    onFileSelect: async (file) => {
      if (file) {
        setUploading(true);
        try {
          const res = await uploadFile.mutateAsync(file);
          const fileUrl = makeAbsoluteUrl(res?.file_url || res?.url);
          const fileKey = res?.file_key;
          setAttachment({
            file,
            url: fileUrl,
            key: fileKey,
            type: "file",
            name: file.name,
            size: file.size,
          });
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    },
  });

  // Check if lamejs is loaded
  useEffect(() => {
    const checkLameJs = () => {
      if (typeof window !== "undefined" && window.lamejs) {
        setLameJsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately in case it's already loaded
    if (checkLameJs()) return;

    // If not loaded, try to load it
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js";
    script.async = true;
    script.onload = () => {
      setLameJsLoaded(true);
    };
    document.body.appendChild(script);

    // Check periodically until loaded
    const interval = setInterval(() => {
      if (checkLameJs()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle voice recording with better error handling
  const handleMicClick = async () => {
    // Stop recording if already recording
    if (recording) {
      try {
        mediaRecorderRef.current?.stop();
      } catch (err) {
        console.error("Error stopping recorder:", err);
      }
      setRecording(false);
      return;
    }

    // Check if mic is supported
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia not supported");
      toast.error("Microphone access is not supported in this browser.");
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Create media recorder with appropriate MIME type
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      // Handle data from recorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      // Process audio when recording stops
      mediaRecorder.onstop = async () => {
        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        try {
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunks.current, {
            type: mediaRecorder.mimeType,
          });

          // Create a direct MP3 file using the recorded audio
          const recordingToMp3 = async (blob: Blob) => {
            try {
              // For simplicity, we'll use a direct approach first

              // Convert blob to a file with MP3 extension
              const mp3File = new File([blob], "voice-message.mp3", {
                type: "audio/mp3",
                lastModified: new Date().getTime(),
              });

              return mp3File;
            } catch (err) {
              console.error("Error creating MP3 file:", err);
              return null;
            }
          };

          // Create MP3 file
          const mp3File = await recordingToMp3(audioBlob);

          if (mp3File) {
            // Set the attachment with the MP3 file
            setAttachment({
              file: mp3File,
              type: "audio",
              name: mp3File.name,
              size: mp3File.size,
            });

            // Create and set the audio URL for preview
            const audioUrl = URL.createObjectURL(mp3File);
            setAudioUrl(audioUrl);
          } else {
            // Fallback to using the original recording
            console.warn("Using original recording as fallback");
            const fallbackFile = new File([audioBlob], "voice-message.webm", {
              type: audioBlob.type,
              lastModified: new Date().getTime(),
            });

            setAttachment({
              file: fallbackFile,
              type: "audio",
              name: fallbackFile.name,
              size: fallbackFile.size,
            });

            const fallbackUrl = URL.createObjectURL(fallbackFile);
            setAudioUrl(fallbackUrl);
          }
        } catch (processingError) {
          console.error("Error processing audio:", processingError);
          toast.error("Failed to process audio recording. Please try again.");
        }
      };

      // Start recording
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error(
        "Could not access microphone. Make sure you've granted permission."
      );
    }
  };

  // Remove attachment
  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    resetImageFile();
    resetDocFile();
  };

  // Send message (with or without attachment)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() && !attachment) return;
    setUploading(true);

    let fileKey = null;
    try {
      // If attachment exists and has no url, upload it first
      if (attachment && !attachment.url) {
        // Check if it's an audio file and ensure it has MP3 extension
        let fileToUpload: File;
        if (
          attachment.type === "audio" &&
          typeof attachment.name === "string" &&
          !attachment.name.toLowerCase().endsWith(".mp3")
        ) {
          // Convert to MP3 file if it's not already
          fileToUpload = new File(
            [attachment.file],
            attachment.name.split(".")[0] + ".mp3",
            { type: "audio/mp3", lastModified: Date.now() }
          );
        } else {
          // Always wrap as File
          fileToUpload = new File(
            [attachment.file],
            typeof attachment.name === "string" ? attachment.name : "file",
            {
              type: typeof attachment.type === "string" ? attachment.type : "",
              lastModified: Date.now(),
            }
          );
        }
        const res = await uploadFile.mutateAsync(fileToUpload);

        fileKey = res?.file_key;
      } else if (attachment) {
        // If attachment already has a URL (was uploaded previously), use the stored key

        fileKey = attachment.key;
      }

      // Only send message after file upload is complete
      if (onSend) {
        onSend({
          body: value,
          file_path: fileKey || undefined,
        });
      }

      // Reset form state
      setValue("");
      setAttachment(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      resetImageFile();
      resetDocFile();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setUploading(false);
      if (onTyping) onTyping(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onTyping) onTyping(!!e.target.value);
  };

  // Only enable send if not uploading and (text or file is ready and has url)
  const canSend = !uploading && (!!value.trim() || attachment !== null);

  return (
    <form
      ref={containerRef}
      className="bg-bg-app flex flex-col gap-2 border-t p-4"
      onSubmit={handleSubmit}
    >
      {/* Attachment preview */}
      {attachment && (
        <div className="bg-bg-surface text-text-muted mb-2 flex w-fit items-center gap-2 rounded p-2">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : attachment.type === "image" ? (
            <img
              alt="preview"
              className="h-10 w-10 rounded object-cover"
              src={attachment.url || URL.createObjectURL(attachment.file)}
            />
          ) : attachment.type === "audio" ? (
            <audio
              controls
              className="h-8"
              src={
                audioUrl ||
                attachment.url ||
                URL.createObjectURL(attachment.file)
              }
            />
          ) : (
            <Link2 className="mr-1 h-5 w-5" />
          )}
          <span className="text-xs font-medium">{attachment.name}</span>
          <span className="text-text-muted text-xs">
            {(attachment.size / 1024 / 1024).toFixed(1)}mb
          </span>
          <Button
            iconOnly
            aria-label="Remove attachment"
            leftIcon={<X className="h-4 w-4" />}
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.GHOST}
            onClick={handleRemoveAttachment}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          iconOnly
          aria-label="Attach image"
          disabled={uploading}
          leftIcon={<ImageIcon className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={() => imageInputRef.current?.click()}
        />
        <SanitizedInput
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleImageChange}
        />
        <Button
          iconOnly
          aria-label="Record voice message"
          disabled={uploading || !lameJsLoaded}
          leftIcon={
            <Mic className={`h-5 w-5 ${recording ? "text-red-500" : ""}`} />
          }
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={handleMicClick}
        />
        <Button
          iconOnly
          aria-label="Attach file"
          disabled={uploading}
          leftIcon={<Paperclip className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={() => fileInputRef.current?.click()}
        />
        <SanitizedInput
          ref={fileInputRef}
          className="hidden"
          type="file"
          onChange={handleDocChange}
        />
        <SanitizedInput
          ref={inputRef}
          className="h-10 flex-1"
          disabled={uploading}
          placeholder="Type a message..."
          value={value}
          onChange={handleInputChange}
          onClick={handleInputFocus}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) {
                void handleSubmit(e as unknown as FormEvent);
              }
            }
          }}
        />
        <Button
          iconOnly
          aria-label="Send message"
          disabled={!canSend}
          leftIcon={<Send className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          type="submit"
        />
      </div>
      {(imageError || docError) && (
        <p className="mt-1 text-sm text-red-500">{imageError || docError}</p>
      )}
    </form>
  );
}
