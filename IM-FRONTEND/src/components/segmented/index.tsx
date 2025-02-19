import { Segmented } from 'antd';
import React, { useState } from 'react';
import { ISegmentedProps } from './types';
import './segmented.css';

/***
 *
 * @param {ISegmentedProps} props - prm
 * @returns {React.FC} -  returm
 */
const ScalableSegment: React.FC<ISegmentedProps> = (props: ISegmentedProps) => {
  const { options, size, block } = props;
  const ZERO = 0;
  const [value, setValue] = useState<string | number>(options[ZERO].value);

  return (
    <>
      <Segmented
        className="bg-[#CEF6DB] rounded-full overflow-hidden custom-segmented"
        size={size}
        block={block}
        options={options}
        onChange={setValue}
      />
      {options?.map((segment, index) => {
        if (segment.value === value) {
          return (
            <div className="w-full" key={index}>
              {segment.content}
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

export default ScalableSegment;
