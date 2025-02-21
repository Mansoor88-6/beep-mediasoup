import React, { useState, useRef, useEffect } from 'react';
import { Image, Modal, Typography, Avatar, Button, Skeleton } from 'antd';
import {
  VideoCameraOutlined,
  FileOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  UserOutlined,
  PauseOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { backendUrl } from 'config';
import { formatDistanceToNow } from 'date-fns';
import MessageReactions from '../chats/MessageReactions';
import { useSelector } from 'react-redux';
import { AuthSelector } from 'appRedux/reducers';
import { useAppDispatch } from 'appRedux/store';
import { sendMessageReaction, removeMessageReaction } from 'appRedux/actions/messageAction';
import { IReaction } from '../types';

interface MediaMessageProps {
  _id?: string;
  type: 'image' | 'video' | 'document' | 'voice';
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  received?: boolean;
  isGroup?: boolean;
  sender?: {
    username?: string;
    avatar?: string;
  };
  timestamp?: Date;
  duration?: number;
  reactions?: IReaction[];
}

/**
 *
 * @param param0
 * @param param0.type
 * @param param0.url
 * @param param0.fileName
 * @param param0.fileSize
 * @param param0.mimeType
 * @param param0.received
 * @param param0.thumbnail
 * @param param0.isGroup
 * @param param0.sender
 * @param param0.timestamp
 * @param param0.duration
 * @param param0._id
 * @param param0.reactions
 * @returns
 */
const MediaMessage: React.FC<MediaMessageProps> = ({
  _id,
  type,
  url,
  fileName,
  fileSize,
  mimeType,
  thumbnail,
  received,
  isGroup,
  sender,
  timestamp,
  duration,
  reactions = []
}) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector(AuthSelector);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReactionsModalVisible, setIsReactionsModalVisible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Add video-specific states at the top level
  const [isVideoDownloaded, setIsVideoDownloaded] = useState(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const thumbnailRef = useRef<HTMLImageElement>(null);

  // Audio states
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(duration || 0);
  const progressUpdateRef = useRef<number | null>(null);

  // Debug logging for props
  // useEffect(() => {
  //   if (type === 'video') {
  //     console.log('Video message props:', {
  //       url: url,
  //       fileName: fileName,
  //       thumbnail: thumbnail,
  //       thumbnailUrl: thumbnail ? getFullUrl(thumbnail) : null,
  //       isInView: isInView,
  //       isThumbnailLoaded: isThumbnailLoaded,
  //       thumbnailError: thumbnailError
  //     });
  //   }
  // }, [type, url, thumbnail, isInView, isThumbnailLoaded, thumbnailError]);

  // Preload thumbnail when URL is available
  useEffect(() => {
    if (type === 'video' && thumbnail && isInView) {
      const thumbnailUrl = getFullUrl(thumbnail);

      // Create a new image to preload
      const img: HTMLImageElement = new window.Image(300, 200);
      img.onload = () => {
        setIsThumbnailLoaded(true);
        setThumbnailError(false);
      };
      img.onerror = (e) => {
        console.error('Error preloading thumbnail:', e);
        setThumbnailError(true);
        setIsThumbnailLoaded(false);
      };
      img.src = thumbnailUrl;

      // Return cleanup function
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
    return undefined;
  }, [type, thumbnail, isInView]);

  // Reset thumbnail states when url or type changes
  useEffect(() => {
    if (type === 'video') {
      setIsThumbnailLoaded(false);
      setThumbnailError(false);
      setIsVideoDownloaded(false);
    }
  }, [url, type]);

  // Reset states when url or type changes
  useEffect(() => {
    if (type === 'voice') {
      setIsAudioLoaded(false);
      setIsAudioLoading(false);
      setAudioError(null);
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioDuration(duration || 0);

      // Cancel any existing animation frame
      if (progressUpdateRef.current) {
        cancelAnimationFrame(progressUpdateRef.current);
        progressUpdateRef.current = null;
      }
    }
  }, [url, type, duration]);

  // Audio loading and event handling
  useEffect(() => {
    if (type === 'voice' && isInView) {
      const audio = new Audio();
      audioRef.current = audio;

      // Configure audio settings
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';

      const fullUrl = getFullUrl(url);

      /**
       * Handles the can play event for the audio
       * @returns {void}
       */
      const handleCanPlay = () => {
        setIsAudioLoaded(true);
        setIsAudioLoading(false);
      };

      /**
       * Handles the loaded metadata event for the audio
       * @returns {void}
       */
      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
          setAudioDuration(audio.duration);
        }
      };

      /**
       * Handles the time update event for the audio
       * @returns {void}
       */
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      /**
       * Handles the ended event for the audio
       * @returns {void}
       */
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audio.currentTime = 0;
      };

      /**
       * Handles the error event for the audio
       * @param {Event} e - The event object
       * @returns {void}
       */
      const handleError = (e: Event) => {
        const error = (e.target as HTMLAudioElement).error;
        console.error('Audio error:', error);
        setAudioError(error?.message || 'Error loading audio');
        setIsAudioLoading(false);
        setIsPlaying(false);

        // Try loading as blob if there's a decode error
        if (error?.code === MediaError.MEDIA_ERR_DECODE) {
          fetch(fullUrl)
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              const blobUrl = URL.createObjectURL(blob);
              audio.src = blobUrl;
              return () => {
                URL.revokeObjectURL(blobUrl);
              };
            })
            .catch((err) => {
              console.error('Fallback audio loading failed:', err);
              setAudioError('Could not load audio file');
            });
        }
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      setIsAudioLoading(true);
      audio.src = fullUrl;
      audio.load();

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);

        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    }
    return undefined;
  }, [type, url, isInView]);

  // Move video download check to top level
  useEffect(() => {
    if (isInView && type === 'video') {
      const videoUrl = getFullUrl(url);
      fetch(videoUrl, { method: 'HEAD' })
        .then((response) => {
          return setIsVideoDownloaded(response.status === 200);
        })
        .catch(() => {
          return setIsVideoDownloaded(false);
        });
    }
  }, [isInView, type, url]);

  React.useEffect(() => {
    if (!videoModalVisible && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoModalVisible]);

  // Intersection Observer setup
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '50px', // Start loading slightly before the media enters viewport
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    if (mediaRef.current) {
      observer.observe(mediaRef.current);
    }

    return () => {
      if (mediaRef.current) {
        observer.unobserve(mediaRef.current);
      }
    };
  }, []);

  /**
   * Handles the media load event
   * @returns {void}
   */
  const handleMediaLoad = () => {
    setIsMediaLoaded(true);
  };

  /**
   * Gets the full URL of a file
   * @param {string} path - The path of the file
   * @returns {string} The full URL of the file
   */
  const getFullUrl = (path: string) => {
    if (!path) {
      return '';
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `${backendUrl}${path}`;
  };

  // console.log('MediaMessage props:', {
  //   type,
  //   url,
  //   fileName,
  //   thumbnail,
  //   thumbnailUrl: thumbnail ? getFullUrl(thumbnail) : null
  // });

  /**
   * Formats the file size
   * @param {number} bytes - The file size in bytes
   * @returns {string} - The formatted file size
   */
  const formatFileSize = (bytes: number = 0) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  /**
   * Gets the appropriate icon for the document type
   * @returns {React.ReactNode} - The icon component
   */
  const getDocumentIcon = () => {
    if (!mimeType) return <FileOutlined className="text-2xl" />;

    if (mimeType.includes('spreadsheet')) {
      return <FileExcelOutlined className="text-green-600 text-2xl" />;
    } else if (mimeType.includes('wordprocessing')) {
      return <FileWordOutlined className="text-blue-600 text-2xl" />;
    } else if (mimeType.includes('pdf')) {
      return <FilePdfOutlined className="text-red-600 text-2xl" />;
    } else if (mimeType.includes('presentation')) {
      return <FilePptOutlined className="text-orange-600 text-2xl" />;
    }

    return <FileOutlined className="text-gray-600 text-2xl" />;
  };

  /**
   * Gets the file extension from the filename
   * @returns {string} - The file extension
   */
  const getFileExtension = () => {
    if (!fileName?.trim()) return '';
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  };

  /**
   * Handles the download of media files from the server
   * @async
   * @function handleDownload
   * @returns {Promise<void>} A promise that resolves when the download is complete
   * @throws {Error} If the download fails or if fileName or url is missing
   * @description Downloads the file from the server, shows progress, and triggers browser download
   */
  const handleDownload = async () => {
    try {
      if (!fileName || !url) {
        console.error('Missing fileName or url for download');
        return;
      }

      setDownloadProgress(0);
      const fullUrl = getFullUrl(url);
      const response = await fetch(fullUrl);
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength || '0', 10);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        setDownloadProgress(Math.round((receivedLength / total) * 100));
      }

      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadProgress(null);
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadProgress(null);
    }
  };

  /**
   * Renders the download button
   * @returns {any} - The rendered download button
   */
  const renderDownloadButton = () => {
    if (downloadProgress !== null) {
      return (
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-2 border-blue-500"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - downloadProgress}%)`
              }}
            />
            <span className="text-[10px] text-gray-600">{downloadProgress}</span>
          </div>
        </div>
      );
    }

    return (
      <DownloadOutlined
        className="text-lg text-gray-500 hover:text-blue-500 cursor-pointer"
        onClick={handleDownload}
      />
    );
  };

  /**
   * Formats the timestamp
   * @param {Date | undefined} date - The timestamp to format
   * @returns {string} - The formatted timestamp
   */
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  /**
   * Formats audio duration in seconds to MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string
   */
  const formatAudioTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Handles the play/pause functionality for audio playback
   * @returns {Promise<void>} A promise that resolves when the audio state is updated
   */
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded) {
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Reset to beginning if ended
        if (audio.currentTime >= audio.duration) {
          audio.currentTime = 0;
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
      setIsPlaying(false);
      setAudioError('Error playing audio');
    }
  };

  /**
   * Handles seeking to a specific position in the audio track
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event from clicking the progress bar
   */
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !isAudioLoaded || !audioDuration) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  /**
   * Handles adding a reaction to a message
   * @param {string} emoji - The emoji to add as a reaction
   * @returns {Promise<void>} A promise that resolves when the reaction is added
   */
  const handleReact = async (emoji: string) => {
    if (!user || !_id) {
      return;
    }
    try {
      await dispatch(
        sendMessageReaction({
          messageId: _id,
          emoji: emoji
        })
      ).unwrap();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  /**
   * Handles removing a reaction from a message
   * @param {string} emoji - The emoji to remove from reactions
   * @returns {Promise<void>} A promise that resolves when the reaction is removed
   */
  const handleRemoveReaction = async (emoji: string) => {
    if (!user || !_id) {
      return;
    }
    try {
      await dispatch(
        removeMessageReaction({
          messageId: _id,
          emoji: emoji
        })
      ).unwrap();
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Group reactions by emoji
  const groupedReactions = React.useMemo(() => {
    const reactionArray: IReaction[] = Array.isArray(reactions) ? reactions : [];
    return reactionArray.reduce((acc: { [key: string]: IReaction[] }, reaction: IReaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {});
  }, [reactions]);

  /**
   * Renders skeleton loaders for different media types while content is loading
   * @returns {React.ReactNode} The skeleton loader component
   */
  const renderSkeleton = () => {
    switch (type) {
      case 'image':
        return (
          <div className="w-[300px] h-[200px] bg-gray-100 rounded-lg overflow-hidden">
            <Skeleton.Image className="w-full h-full" active />
          </div>
        );
      case 'video':
        return (
          <div className="w-[300px] h-[200px] bg-gray-100 rounded-lg overflow-hidden">
            <Skeleton.Image className="w-full h-full" active />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black bg-opacity-20 flex items-center justify-center">
                <VideoCameraOutlined className="text-2xl text-gray-300" />
              </div>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="flex items-start gap-3 bg-white rounded-lg p-4 max-w-[300px]">
            <Skeleton.Button active size="large" shape="square" />
            <div className="flex-1">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="flex items-start gap-3 p-3 bg-white rounded-2xl shadow-sm max-w-[280px]">
            <Skeleton.Button active size="small" shape="circle" />
            <div className="flex-1">
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * Renders the content of the media message
   * @returns {React.ReactNode} - The rendered content
   */
  const renderContent = () => {
    if (!isInView) {
      return renderSkeleton();
    }

    switch (type) {
      case 'image':
        return (
          <div className="relative group cursor-pointer">
            {!isMediaLoaded && renderSkeleton()}
            <Image
              src={getFullUrl(url)}
              alt={fileName}
              className={`rounded-lg max-w-[300px] max-h-[300px] object-cover ${
                !isMediaLoaded ? 'hidden' : ''
              }`}
              onLoad={handleMediaLoad}
              preview={isMediaLoaded}
              placeholder={<div />}
            />
            {isMediaLoaded && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <Typography.Text className="text-white text-xs">{fileName}</Typography.Text>
                  {renderDownloadButton()}
                </div>
              </div>
            )}
            <div className="mt-1 text-right">
              <Typography.Text className="text-xs text-gray-500">
                {formatTime(timestamp)}
              </Typography.Text>
            </div>
          </div>
        );

      case 'video':
        const thumbnailUrl = thumbnail ? getFullUrl(thumbnail) : null;

        return (
          <>
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                if (isVideoDownloaded) {
                  setVideoModalVisible(true);
                }
              }}>
              <div className="w-[300px] h-[200px] bg-black rounded-lg overflow-hidden">
                {!isThumbnailLoaded && !thumbnailError && renderSkeleton()}
                {thumbnailUrl && !thumbnailError && (
                  <img
                    ref={thumbnailRef}
                    src={thumbnailUrl}
                    alt={fileName}
                    className={`w-full h-full object-cover opacity-80 ${
                      !isThumbnailLoaded ? 'opacity-0' : 'opacity-80'
                    } transition-opacity duration-200`}
                    loading="eager"
                    crossOrigin="anonymous"
                    onLoad={(e) => {
                      setIsThumbnailLoaded(true);
                      setThumbnailError(false);
                      (e.target as HTMLImageElement).style.opacity = '0.8';
                    }}
                    onError={(e) => {
                      console.error('Error loading thumbnail in DOM:', {
                        url: thumbnailUrl,
                        error: e
                      });
                      setThumbnailError(true);
                      setIsThumbnailLoaded(false);
                    }}
                  />
                )}
                {(!thumbnailUrl || thumbnailError || !isThumbnailLoaded) && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <VideoCameraOutlined className="text-4xl text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                    {isVideoDownloaded ? (
                      <div className="play-button-triangle" />
                    ) : (
                      <VideoCameraOutlined className="text-2xl text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <Typography.Text className="text-white text-xs truncate flex-1" title={fileName}>
                    {fileName}
                  </Typography.Text>
                  {!isVideoDownloaded && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload().then(() => {
                          setIsVideoDownloaded(true);
                        });
                      }}>
                      {renderDownloadButton()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-1 text-right">
              <Typography.Text className="text-xs text-gray-500">
                {formatTime(timestamp)}
              </Typography.Text>
            </div>
          </>
        );

      case 'document':
        return (
          <>
            <div className="flex items-start gap-3 bg-white rounded-lg p-4 max-w-[300px] hover:bg-gray-50 transition-colors group">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {getDocumentIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <Typography.Text
                  className="block text-sm font-medium text-gray-900 truncate"
                  title={fileName?.trim() || 'Unnamed file'}>
                  {fileName?.trim() || 'Unnamed file'}
                </Typography.Text>
                <div className="flex items-center gap-2 mt-1">
                  {getFileExtension() && (
                    <>
                      <span className="text-xs text-gray-500">{getFileExtension()}</span>
                      <span className="text-xs text-gray-400">•</span>
                    </>
                  )}
                  {fileSize ? (
                    <span className="text-xs text-gray-500">{formatFileSize(fileSize)}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {renderDownloadButton()}
              </div>
            </div>
            <div className="mt-1 text-right">
              <Typography.Text className="text-xs text-gray-500">
                {formatTime(timestamp)}
              </Typography.Text>
            </div>
          </>
        );

      case 'voice':
        return (
          <div
            className={`flex items-start gap-3 p-3 ${
              received ? 'bg-white' : 'bg-[#E3F7ED]'
            } rounded-2xl shadow-sm max-w-[280px] relative`}>
            {!isInView ? (
              renderSkeleton()
            ) : (
              <>
                {/* Play/Stop button */}
                <Button
                  type="text"
                  shape="circle"
                  size="small"
                  icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                  onClick={handlePlayPause}
                  className={`flex-shrink-0 ${
                    isAudioLoading ? 'opacity-50 cursor-not-allowed' : ''
                  } text-green-600 hover:text-green-700 hover:bg-green-50`}
                  disabled={isAudioLoading || !isAudioLoaded || Boolean(audioError)}
                />

                {/* Progress bar and time */}
                <div className="flex-1 flex flex-col gap-2">
                  {audioError ? (
                    <div className="text-red-500 text-xs">{audioError}</div>
                  ) : (
                    <>
                      {/* Interactive progress bar */}
                      <div
                        className="h-8 flex items-center cursor-pointer relative group"
                        onClick={handleSeek}>
                        {/* Background track */}
                        <div className="absolute top-1/2 left-0 w-full h-1.5 -translate-y-1/2 bg-gray-200 rounded-full overflow-hidden">
                          {/* Progress fill */}
                          <div
                            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-transform"
                            style={{
                              transform: `translateX(${
                                (currentTime / (audioDuration || 1)) * 100 - 100
                              }%)`
                            }}
                          />
                        </div>

                        {/* Progress handle */}
                        <div
                          className="absolute top-1/2 h-3 w-3 bg-green-600 rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
                          style={{
                            left: `${(currentTime / (audioDuration || 1)) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>

                      {/* Time display */}
                      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <div className="flex items-center gap-1 tabular-nums">
                          <span className="font-medium">{formatAudioTime(currentTime)}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-400">
                            {audioDuration ? formatAudioTime(audioDuration) : '--:--'}
                          </span>
                        </div>
                        <div className="border-l border-gray-200 pl-2 ml-4">
                          <span className="text-[10px] text-gray-400">
                            {timestamp
                              ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`flex ${received ? 'justify-start' : 'justify-end'} mb-2 px-4`}
        ref={mediaRef}>
        {isGroup && received && (
          <div className="flex-shrink-0 mr-2 mt-4">
            <Avatar
              size={28}
              src={sender?.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#CEF6DB' }}
            />
          </div>
        )}
        <div className="flex flex-col">
          {isGroup && received && (
            <span className="text-xs font-medium text-green-600 mb-0.5 ml-1">
              {sender?.username}
            </span>
          )}
          <div className="relative group">
            <div
              className={`rounded-lg overflow-hidden ${
                type === 'document' ? '' : 'bg-white shadow-sm'
              }`}>
              {renderContent()}
            </div>

            {/* Reaction buttons (shown on hover) */}
            {user && (
              <div
                className={`absolute ${
                  received ? 'right-0 translate-x-[105%]' : 'left-0 -translate-x-[105%]'
                } top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out z-20`}>
                <MessageReactions
                  reactions={Array.isArray(reactions) ? reactions : []}
                  onReact={handleReact}
                  onRemoveReaction={handleRemoveReaction}
                  currentUserId={user._id}
                />
              </div>
            )}

            {/* Reactions display */}
            {Array.isArray(reactions) && reactions.length > 0 && (
              <div
                className={`absolute ${
                  received ? '-right-2' : '-left-2'
                } -bottom-2 bg-white rounded-full shadow-sm border border-gray-100 px-1.5 py-0.5 
                  flex items-center gap-0.5 text-xs z-10 hover:shadow-md transition-shadow duration-200 cursor-pointer`}
                onClick={() => {
                  setIsReactionsModalVisible(true);
                }}>
                {Object.entries(groupedReactions).map(([emoji, reactors]) => {
                  const hasUserReacted = reactors.some((r) => {
                    return r.userId === user?._id;
                  });
                  return (
                    <span
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasUserReacted) {
                          handleRemoveReaction(emoji);
                        } else {
                          handleReact(emoji);
                        }
                      }}
                      className={`px-0.5 rounded transition-all duration-200 hover:scale-125 ${
                        hasUserReacted ? 'text-green-600' : ''
                      }`}>
                      {emoji}
                    </span>
                  );
                })}
                <span className="text-gray-400 text-[10px] ml-0.5 min-w-[14px] text-center">
                  {reactions.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reactions Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-lg font-medium">Message Reactions</span>
            <div className="flex gap-2">
              {Object.entries(groupedReactions).map(([emoji, reactors]) => {
                return (
                  <div
                    key={emoji}
                    className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full">
                    <span className="text-base">{emoji}</span>
                    <span className="text-sm text-gray-600 font-medium">{reactors.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        }
        open={isReactionsModalVisible}
        onCancel={() => {
          setIsReactionsModalVisible(false);
        }}
        footer={null}
        width={400}
        className="reactions-modal">
        <div className="flex flex-col gap-4 mt-4">
          {Object.entries(groupedReactions).map(([emoji, reactors]) => {
            return (
              <div key={emoji} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm text-gray-600">
                    {reactors.length} {reactors.length === 1 ? 'reaction' : 'reactions'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {reactors.map((reactor) => {
                    return (
                      <div key={reactor.userId} className="flex items-center gap-2 py-1">
                        <Avatar
                          size="small"
                          icon={<UserOutlined />}
                          className="bg-[#E3F7ED] text-green-600"
                        />
                        <span className="text-sm font-medium">{reactor.username}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatDistanceToNow(new Date(reactor.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal
        open={videoModalVisible}
        footer={null}
        onCancel={() => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setVideoModalVisible(false);
        }}
        width={800}
        centered
        destroyOnClose
        className="video-modal"
        closeIcon={<div className="close-icon">×</div>}>
        <video ref={videoRef} controls className="w-full rounded-lg">
          <source src={getFullUrl(url)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Modal>

      <style>
        {`
          .play-button-triangle {
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 12px 0 12px 20px;
            border-color: transparent transparent transparent white;
            margin-left: 4px;
          }

          .video-modal .ant-modal-close {
            top: -30px;
            right: -30px;
          }

          .close-icon {
            color: white;
            font-size: 24px;
            font-weight: bold;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
          }

          .reactions-modal .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }
          .reactions-modal .ant-modal-header {
            border-bottom: none;
            padding-bottom: 0;
          }
          .reactions-modal .ant-modal-body {
            padding: 20px;
          }
          .reactions-modal .ant-modal-close {
            top: 16px;
          }
        `}
      </style>
    </>
  );
};

export default MediaMessage;
