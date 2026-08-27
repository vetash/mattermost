// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import debounce from 'lodash/debounce';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {WithTooltip} from '@mattermost/shared/components/tooltip';

import {ZoomSettings} from 'utils/constants';

export interface Props {
    scale?: number;
    defaultScale?: number;
    maxScale?: number;
    showZoomControls?: boolean;
    handleZoomIn?: () => void;
    handleZoomOut?: () => void;
    handleZoomReset?: () => void;
    showImageTransformControls?: boolean;
    isFlipHorizontal?: boolean;
    isFlipVertical?: boolean;
    handleRotateClockwise?: () => void;
    handleRotateCounterClockwise?: () => void;
    handleFlipHorizontal?: () => void;
    handleFlipVertical?: () => void;
}

export default class PopoverBar extends React.PureComponent<Props> {
    render() {
        const defaultScale = this.props.defaultScale ?? ZoomSettings.DEFAULT_SCALE;
        const maxScale = this.props.maxScale ?? ZoomSettings.MAX_SCALE;
        const zoomControls: React.ReactNode[] = [];
        let wrappedZoomControls: React.ReactNode = null;
        if (this.props.showZoomControls) {
            let zoomResetButton;
            let zoomOutButton;
            let zoomInButton;

            if (this.props.scale && this.props.scale > ZoomSettings.MIN_SCALE) {
                zoomOutButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomOut && debounce(this.props.handleZoomOut, 300, {maxWait: 300})}>
                            <i className='icon icon-minus'/>
                        </a>
                    </span>
                );
            } else {
                zoomOutButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-minus'/>
                    </span>
                );
            }
            zoomControls.push(
                <WithTooltip
                    key='zoomOut'
                    title={
                        <FormattedMessage
                            id='view_image.zoom_out'
                            defaultMessage='Zoom Out'
                        />
                    }
                >
                    {zoomOutButton}
                </WithTooltip>,
            );

            if (this.props.scale && this.props.scale > defaultScale) {
                zoomResetButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomReset}>
                            <i className='icon icon-magnify-minus'/>
                        </a>
                    </span>
                );
            } else if (this.props.scale && this.props.scale < defaultScale) {
                zoomResetButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomReset}>
                            <i className='icon icon-magnify-plus'/>
                        </a>
                    </span>
                );
            } else {
                zoomResetButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-magnify-minus'/>
                    </span>
                );
            }
            zoomControls.push(
                <WithTooltip
                    key='zoomReset'
                    title={
                        <FormattedMessage
                            id='view_image.zoom_reset'
                            defaultMessage='Reset Zoom'
                        />
                    }
                >
                    {zoomResetButton}
                </WithTooltip>,
            );

            if (this.props.scale && this.props.scale < maxScale) {
                zoomInButton = (
                    <span className='modal-zoom-btn'>
                        <a onClick={this.props.handleZoomIn && debounce(this.props.handleZoomIn, 300, {maxWait: 300})}>
                            <i className='icon icon-plus'/>
                        </a>
                    </span>

                );
            } else {
                zoomInButton = (
                    <span className='btn-inactive'>
                        <i className='icon icon-plus'/>
                    </span>
                );
            }
            zoomControls.push(
                <WithTooltip
                    key='zoomIn'
                    title={
                        <FormattedMessage
                            id='view_image.zoom_in'
                            defaultMessage='Zoom In'
                        />
                    }
                >
                    {zoomInButton}
                </WithTooltip>,
            );

            if (this.props.showImageTransformControls) {
                zoomControls.push(
                    <WithTooltip
                        key='rotateCounterClockwise'
                        title={
                            <FormattedMessage
                                id='view_image.rotate_counter_clockwise'
                                defaultMessage='Rotate Counter Clockwise'
                            />
                        }
                    >
                        <span className='modal-zoom-btn'>
                            <a
                                onClick={this.props.handleRotateCounterClockwise}
                                aria-label='Rotate counter clockwise'
                            >
                                <i className='icon icon-refresh file-preview-modal-image-controls__rotate-ccw'/>
                            </a>
                        </span>
                    </WithTooltip>,
                    <WithTooltip
                        key='rotateClockwise'
                        title={
                            <FormattedMessage
                                id='view_image.rotate_clockwise'
                                defaultMessage='Rotate Clockwise'
                            />
                        }
                    >
                        <span className='modal-zoom-btn'>
                            <a
                                onClick={this.props.handleRotateClockwise}
                                aria-label='Rotate clockwise'
                            >
                                <i className='icon icon-refresh'/>
                            </a>
                        </span>
                    </WithTooltip>,
                    <WithTooltip
                        key='flipHorizontal'
                        title={
                            <FormattedMessage
                                id='view_image.flip_horizontal'
                                defaultMessage='Flip Horizontal'
                            />
                        }
                    >
                        <span
                            className={classNames(
                                'modal-zoom-btn',
                                'file-preview-modal-image-controls__flip-button',
                                {active: this.props.isFlipHorizontal},
                            )}
                        >
                            <a
                                onClick={this.props.handleFlipHorizontal}
                                aria-label='Flip horizontal'
                            >
                                <span className='file-preview-modal-image-controls__flip-label'>{'H'}</span>
                            </a>
                        </span>
                    </WithTooltip>,
                    <WithTooltip
                        key='flipVertical'
                        title={
                            <FormattedMessage
                                id='view_image.flip_vertical'
                                defaultMessage='Flip Vertical'
                            />
                        }
                    >
                        <span
                            className={classNames(
                                'modal-zoom-btn',
                                'file-preview-modal-image-controls__flip-button',
                                {active: this.props.isFlipVertical},
                            )}
                        >
                            <a
                                onClick={this.props.handleFlipVertical}
                                aria-label='Flip vertical'
                            >
                                <span className='file-preview-modal-image-controls__flip-label'>{'V'}</span>
                            </a>
                        </span>
                    </WithTooltip>,
                );
            }

            wrappedZoomControls = (
                <div className='modal-column'>
                    {zoomControls}
                </div>
            );
        }

        return (
            <div
                data-testid='fileCountFooter'
                className='modal-button-bar file-preview-modal__zoom-bar'
            >
                {wrappedZoomControls}
            </div>
        );
    }
}
