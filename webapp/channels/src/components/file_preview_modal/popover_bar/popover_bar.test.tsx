// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import PopoverBar from 'components/file_preview_modal/popover_bar/popover_bar';

import {render} from 'tests/react_testing_utils';

describe('components/file_preview_modal/popover_bar/PopoverBar', () => {
    const defaultProps = {
        showZoomControls: false,
    };

    test('should match snapshot with zoom controls enabled', () => {
        const props = {
            ...defaultProps,
            showZoomControls: true,
        };

        const {container} = render(<PopoverBar {...props}/>);
        expect(container).toMatchSnapshot();
    });

    test('should match snapshot with image transform controls enabled', () => {
        const props = {
            ...defaultProps,
            showZoomControls: true,
            showImageTransformControls: true,
            isFlipHorizontal: true,
            handleRotateClockwise: jest.fn(),
            handleRotateCounterClockwise: jest.fn(),
            handleFlipHorizontal: jest.fn(),
            handleFlipVertical: jest.fn(),
        };

        const {container} = render(<PopoverBar {...props}/>);
        expect(container).toMatchSnapshot();
    });
});
