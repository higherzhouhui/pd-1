import styled from 'styled-components';
import {space} from 'styled-system';

import {RadioProps, RadioContainerProps, scales} from './types';

import {handleToPx} from '@/utils';

const getScale = ({scale}: RadioProps) => {
  switch (scale) {
    case scales.SM:
      return '24px';
    case scales.MD:
    default:
      return '32px';
  }
};

export const RadioContainer = styled.div<RadioContainerProps>`
  display: flex;
  align-items: center;
  margin-right: ${({mr}) => (mr ? handleToPx(mr) : 0)};
`;

export const RadioGroupContainer = styled.div<RadioContainerProps>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

export const RadioText = styled.span`
  font-size: 14px;
  color: #000000;
  margin-left: 8px;
`;
export const RadioBox = styled.input.attrs({type: 'radio'})<RadioProps>`
  appearance: none;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  display: inline-block;
  height: ${getScale};
  width: ${getScale};
  vertical-align: middle;
  transition: background-color 0.2s ease-in-out;
  border: 1px solid #eef0f2;
  border-radius: 50%;
  /* background-color: ${({theme}) => theme.colors.input};
  box-shadow: ${({theme}) => theme.shadows.inset}; */

  &:after {
    content: '';
    position: absolute;
    border-bottom: 2px solid;
    border-left: 2px solid;
    border-color: transparent;
    top: 21%;
    left: 0;
    right: 0;
    width: 50%;
    height: 25%;
    margin: auto;
    transform: rotate(-50deg);
    transition: border-color 0.2s ease-in-out;
  }

  &:hover:not(:disabled):not(:checked) {
    /* box-shadow: ${({theme}) => theme.shadows.focus}; */
  }

  &:focus {
    outline: none;
    /* box-shadow: ${({theme}) => theme.shadows.focus}; */
  }

  &:checked {
    /* background-color: ${({theme}) => theme.colors.success}; */
    background-color: #53a9ff;
    &:after {
      border-color: white;
      /* background-color: #53A9FF; */
      /* background-color: ${({theme}) => theme.radio.handleBackground}; */
    }
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
  ${space}
`;
