import React, { useState, useRef, useEffect } from 'react';
import { Button, message } from 'antd';
import { AudioOutlined, PauseOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

/**
 * VoiceRecorder component for recording voice messages
 * @param {VoiceRecorderProps} props - The component props
 * @param {Function} props.onSend - Callback function to handle the recorded audio blob
 * @param {Function} props.onCancel - Callback function to handle the cancel action
 */
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Stops the recording process and cleans up resources
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    // Start recording immediately when component mounts
    startRecording();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopRecording();
    };
  }, []);

  /**
   * Starts the recording process
   * @returns {Promise<void>}
   */
  const startRecording = async () => {
    try {
      chunksRef.current = []; // Clear previous chunks
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          // Create blob immediately when data is available
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setRecordedBlob(audioBlob);
        }
      };

      // Request data every 100ms to get real-time blob updates
      mediaRecorderRef.current.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      message.error('Could not access microphone');
      onCancel();
    }
  };

  /**
   * Handles pausing and resuming the recording
   */
  const handlePauseResume = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording();
    }
  };

  /**
   * Handles sending the recorded voice message
   */
  const handleSend = () => {
    if (recordedBlob) {
      stopRecording();
      onSend(recordedBlob, duration);
    }
  };

  /**
   * Handles canceling the recording and cleaning up resources
   */
  const handleCancel = () => {
    stopRecording();
    chunksRef.current = [];
    setDuration(0);
    setIsRecording(false);
    setRecordedBlob(null);
    onCancel();
  };

  /**
   * Formats the duration of the recording
   * @param {number} seconds - The duration in seconds
   * @returns {string} The formatted duration
   */
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!recordedBlob && !isRecording) {
    return (
      <div className="flex items-center gap-2 w-full justify-center p-2 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-500">Initializing microphone...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <Button
          type={isRecording ? 'primary' : 'default'}
          danger={isRecording}
          shape="circle"
          icon={isRecording ? <PauseOutlined /> : <AudioOutlined />}
          onClick={handlePauseResume}
        />
        <span className={`text-sm text-gray-600 ${isRecording ? 'animate-pulse' : ''}`}>
          {isRecording ? 'Recording...' : ''} {formatDuration(duration)}
        </span>
      </div>
      {recordedBlob && (
        <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} />
      )}
      <Button type="text" danger icon={<DeleteOutlined />} onClick={handleCancel} />
    </div>
  );
};

export default VoiceRecorder;
