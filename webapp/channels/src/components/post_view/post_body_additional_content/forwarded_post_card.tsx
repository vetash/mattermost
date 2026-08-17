// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {Post} from '@mattermost/types/posts';

import PostMessageView from 'components/post_view/post_message_view';
import Timestamp from 'components/timestamp';

import './forwarded_post_card.scss';

type ForwardedPost = {
    original_post_id: string;
    original_channel_id: string;
    original_channel_type?: string;
    original_channel_display_name?: string;
    original_user_id: string;
    original_username?: string;
    original_user_display_name?: string;
    original_message: string;
    original_create_at: number;
    original_permalink?: string;
    original_file_ids?: string[];
};

function isForwardedPost(value: unknown): value is ForwardedPost {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<ForwardedPost>;
    return typeof candidate.original_post_id === 'string' &&
        typeof candidate.original_user_id === 'string' &&
        typeof candidate.original_message === 'string' &&
        typeof candidate.original_create_at === 'number';
}

type Props = {
    post: Post;
};

export default function ForwardedPostCard({post}: Props) {
    const {locale} = useIntl();
    const forwarded = post.props?.forwarded_post;

    if (!isForwardedPost(forwarded)) {
        return null;
    }

    const authorName = forwarded.original_user_display_name || forwarded.original_username || forwarded.original_user_id;
    const channelName = forwarded.original_channel_display_name;
    const forwardedMessagePost: Post = {
        ...post,
        id: `${post.id}_forwarded`,
        user_id: forwarded.original_user_id,
        channel_id: forwarded.original_channel_id || post.channel_id,
        create_at: forwarded.original_create_at,
        update_at: forwarded.original_create_at,
        message: forwarded.original_message,
        props: {},
        metadata: {
            embeds: [],
            emojis: [],
            files: [],
            images: {},
        },
        file_ids: forwarded.original_file_ids || [],
    };

    return (
        <div className='forwarded-post-card'>
            <div className='forwarded-post-card__label'>
                <i className='icon icon-reply-outline'/>
                <span>
                    <FormattedMessage
                        id='forwarded_post_card.label'
                        defaultMessage='Forwarded message from {author}'
                        values={{author: authorName}}
                    />
                    {channelName && (
                        <span className='forwarded-post-card__source'>
                            {' '}
                            <FormattedMessage
                                id='forwarded_post_card.source'
                                defaultMessage='in ~{channel}'
                                values={{channel: channelName}}
                            />
                        </span>
                    )}
                </span>
            </div>
            <div className='forwarded-post-card__content'>
                <div className='forwarded-post-card__header'>
                    <span className='forwarded-post-card__avatar'>
                        {authorName.charAt(0).toUpperCase()}
                    </span>
                    <span className='forwarded-post-card__author'>{authorName}</span>
                    <Timestamp
                        value={forwarded.original_create_at}
                        units={[
                            'now',
                            'minute',
                            'hour',
                            'day',
                        ]}
                        useTime={false}
                        day='numeric'
                        className='forwarded-post-card__time'
                    />
                </div>
                <PostMessageView
                    post={forwardedMessagePost}
                    userLanguage={locale}
                    isChannelAutotranslated={false}
                    disableInteractions={true}
                />
            </div>
        </div>
    );
}
