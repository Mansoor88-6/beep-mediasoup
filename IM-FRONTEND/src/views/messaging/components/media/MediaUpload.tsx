import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { FileImageOutlined, FileOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';

const MAX_IMAGE_SIZE = 16 * 1024 * 1024; // 16MB
const MAX_VIDEO_SIZE = 128 * 1024 * 1024; // 128MB
const MAX_DOC_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

interface MediaUploadProps {
  visible: boolean;
  onClose: () => void;
  onSend: (files: UploadFile[]) => void;
}

/**
 * MediaUpload component for sharing media files in messaging
 * @param {object} props - Component props
 * @param {boolean} props.visible - Whether the upload modal is visible
 * @param {Function} props.onClose - Callback function to close the upload modal
 * @param {Function} props.onSend - Callback function to send the uploaded files
 */
const MediaUpload: React.FC<MediaUploadProps> = ({ visible, onClose, onSend }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  /**
   * Checks if the file type is allowed
   * @param {RcFile} file - The file to check
   * @returns {boolean} - True if the file type is allowed, false otherwise
   */
  const beforeUpload = (file: RcFile) => {
    // Check file type
    const isAllowedType =
      ALLOWED_IMAGE_TYPES.includes(file.type) ||
      ALLOWED_VIDEO_TYPES.includes(file.type) ||
      ALLOWED_DOC_TYPES.includes(file.type);

    if (!isAllowedType) {
      message.error('Unsupported file type');
      return Upload.LIST_IGNORE;
    }

    // Check file size based on type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const maxSize = isImage ? MAX_IMAGE_SIZE : isVideo ? MAX_VIDEO_SIZE : MAX_DOC_SIZE;

    if (file.size > maxSize) {
      message.error(`File must be smaller than ${isImage ? '16MB' : isVideo ? '128MB' : '100MB'}`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  /**
   * Handles previewing the uploaded file
   * @param {UploadFile} file - The file to preview
   */
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  /**
   * Gets the base64 representation of the file
   * @param {RcFile} file - The file to get the base64 representation of
   * @returns {Promise<string>} - The base64 representation of the file
   */
  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        return resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        return reject(error);
      };
    });
  };

  /**
   * Handles changing the file list
   * @param {UploadProps['onChange']} newFileList - The new file list
   */
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  /**
   * Simulates the file upload progress
   * @param {UploadFile} file - The file to simulate the upload for
   * @returns {Promise<void>} - A promise that resolves when the upload is complete
   */
  const simulateFileUpload = (file: UploadFile) => {
    return new Promise<void>((resolve) => {
      let progress = 0;

      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress((prev) => {
          return {
            ...prev,
            [file.uid]: Math.min(Math.round(progress), 100)
          };
        });
      }, 200);
    });
  };

  /**
   * Handles sending the uploaded files
   */
  const handleSend = async () => {
    if (fileList.length === 0) {
      message.warning('Please select at least one file');
      return;
    }

    setUploading(true);

    try {
      // Simulate upload progress for each file
      await Promise.all(
        fileList.map((file) => {
          return simulateFileUpload(file);
        })
      );

      // Send files after "upload" is complete
      onSend(fileList);
      setUploading(false);
      setFileList([]);
      setUploadProgress({});
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('Failed to upload files');
      setUploading(false);
    }
  };

  /**
   * Custom progress render for the upload
   * @param {React.ReactElement} originNode - The original node to render
   * @param {UploadFile} file - The file to render the progress for
   * @returns {React.ReactNode} - The rendered progress node
   */
  const customProgressRender = (originNode: React.ReactElement, file: UploadFile) => {
    const progress = uploadProgress[file.uid] || 0;
    if (uploading && progress < 100) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
      );
    }
    return originNode;
  };

  const uploadButton = (
    <div className="flex flex-col items-center">
      <FileImageOutlined className="text-2xl mb-2" />
      <div>Click or drag files to upload</div>
    </div>
  );

  return (
    <Modal
      title="Share Media"
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          onClick={handleSend}
          loading={uploading}
          disabled={fileList.length === 0}>
          {uploading ? 'Sending...' : 'Send'}
        </Button>
      ]}>
      <Upload.Dragger
        multiple
        listType="picture"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
          showDownloadIcon: false
        }}
        progress={{
          strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068'
          },
          strokeWidth: 3
        }}
        itemRender={(originNode, file) => {
          return customProgressRender(originNode, file);
        }}
        customRequest={({ onSuccess }) => {
          return onSuccess?.('ok');
        }}
        className="mb-4">
        {uploadButton}
      </Upload.Dragger>

      <div className="text-xs text-gray-500 mt-2">
        <p>• Images: Up to 16MB (JPEG, PNG, GIF, WEBP)</p>
        <p>• Videos: Up to 128MB (MP4, WebM, QuickTime)</p>
        <p>• Documents: Up to 100MB (PDF, DOC, DOCX, XLS, XLSX, TXT)</p>
      </div>

      <Modal
        open={previewVisible}
        title={previewFile?.name}
        footer={null}
        onCancel={() => {
          return setPreviewVisible(false);
        }}>
        {previewFile?.type?.startsWith('image/') ? (
          <img
            alt="preview"
            style={{ width: '100%' }}
            src={previewFile?.preview || previewFile?.url}
          />
        ) : previewFile?.type?.startsWith('video/') ? (
          <video
            controls
            style={{ width: '100%' }}
            src={previewFile?.preview || previewFile?.url}
          />
        ) : (
          <div className="text-center py-8">
            <FileOutlined className="text-4xl mb-2" />
            <p>{previewFile?.name}</p>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default MediaUpload;
