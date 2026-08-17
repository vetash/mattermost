// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@mattermost/types/channels';
import type {FileInfo} from '@mattermost/types/files';
import type {Post, PostMetadata} from '@mattermost/types/posts';

import {logError} from 'mattermost-redux/actions/errors';
import * as PostActions from 'mattermost-redux/actions/posts';
import {Client4} from 'mattermost-redux/client';
import {Permissions} from 'mattermost-redux/constants';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {haveIChannelPermission, haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, getUser} from 'mattermost-redux/selectors/entities/users';

import {getPermalinkURL} from 'selectors/urls';

import {ActionTypes, AnnouncementBarTypes} from 'utils/constants';
import {containsAtChannel, groupsMentionedInText} from 'utils/post_utils';
import {getSiteURL} from 'utils/url';
import {getTimestamp} from 'utils/utils';

import type {ActionFuncAsync} from 'types/store';

import {runMessageWillBePostedHooks} from '../hooks';

export function editPost(post: Post): ActionFuncAsync<Post> {
    return async (dispatch) => {
        const result = await dispatch(PostActions.editPost(post));

        // Send to error bar if it's an edit post error about time limit.
        if (result.error && result.error.server_error_id === 'api.post.update_post.permissions_time_limit.app_error') {
            dispatch(logError({type: AnnouncementBarTypes.ANNOUNCEMENT, message: result.error.message}));
        }

        return result;
    };
}

export function forwardPost(post: Post, channel: Channel, message = ''): ActionFuncAsync<PostActions.CreatePostReturnType> {
    return async (dispatch, getState) => {
        const state = getState();
        const channelId = channel.id;

        const currentUserId = getCurrentUserId(state);
        const currentTeam = getCurrentTeam(state);

        if (!currentTeam) {
            return {};
        }

        const relativePermaLink = getPermalinkURL(state, currentTeam.id, post.id);
        const permaLink = `${getSiteURL()}${relativePermaLink}`;
        const originalChannel = getChannel(state, post.channel_id);
        const originalUser = getUser(state, post.user_id);
        const originalDisplayName = originalUser?.nickname || [originalUser?.first_name, originalUser?.last_name].filter(Boolean).join(' ') || originalUser?.username || post.user_id;

        const license = getLicense(state);
        const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
        const useLDAPGroupMentions = isLDAPEnabled && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
        const useChannelMentions = haveIChannelPermission(state, channel.team_id, channelId, Permissions.USE_CHANNEL_MENTIONS);
        const useCustomGroupMentions = isCustomGroupsEnabled(state) && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
        const groupsWithAllowReference = useLDAPGroupMentions || useCustomGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeam.id, channelId) : null;

        let newPost = {} as Post;

        newPost.channel_id = channelId;

        const time = getTimestamp();
        const userId = currentUserId;

        const copiedFiles: FileInfo[] = post.file_ids?.length ? await Client4.copyFileInfosForPost(post.id) : [];
        const copiedFileIds = copiedFiles.map((file) => file.id);

        newPost.message = message;
        newPost.pending_post_id = `${userId}:${time}`;
        newPost.user_id = userId;
        newPost.create_at = time;
        newPost.metadata = {} as PostMetadata;
        newPost.props = {
            forwarded_post: {
                original_post_id: post.id,
                original_channel_id: post.channel_id,
                original_channel_type: originalChannel?.type || '',
                original_channel_display_name: originalChannel?.display_name || '',
                original_user_id: post.user_id,
                original_username: originalUser?.username || '',
                original_user_display_name: originalDisplayName,
                original_message: post.message,
                original_create_at: post.create_at,
                original_permalink: permaLink,
                original_file_ids: copiedFileIds,
            },
        };

        if (!useChannelMentions && containsAtChannel(newPost.message, {checkAllMentions: true})) {
            newPost.props.mentionHighlightDisabled = true;
        }

        if (!useLDAPGroupMentions && !useCustomGroupMentions && groupsMentionedInText(newPost.message, groupsWithAllowReference)) {
            newPost.props.disable_group_highlight = true;
        }

        const hookResult = await dispatch(runMessageWillBePostedHooks(newPost));

        if (hookResult.error) {
            return hookResult as PostActions.CreatePostReturnType;
        }

        newPost = hookResult.data!;

        if (copiedFileIds.length) {
            newPost.file_ids = copiedFileIds;
        }

        return dispatch(PostActions.createPost(newPost, copiedFiles));
    };
}

export function selectAttachmentMenuAction(
    postId: string,
    actionId: string,
    cookie: string,
    dataSource: string | undefined,
    text: string,
    value: string,
): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({
            type: ActionTypes.SELECT_ATTACHMENT_MENU_ACTION,
            data: {
                postId,
                actions: {
                    [actionId]: {
                        text,
                        value,
                    },
                },
            },
        });

        dispatch(PostActions.doPostActionWithCookie(postId, actionId, cookie, value, undefined, ''));

        return {data: true};
    };
}
