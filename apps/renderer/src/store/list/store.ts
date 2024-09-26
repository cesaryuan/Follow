import { apiClient } from "~/lib/api-fetch"
import type { FeedModel, ListModel, ListModelPoplutedFeeds } from "~/models"

import { feedActions } from "../feed"
import { createImmerSetter, createZustandStore } from "../utils/helper"
import type { ListState } from "./types"

export const useListStore = createZustandStore<ListState>("list")(() => ({
  lists: {},
}))

const set = createImmerSetter(useListStore)
const get = useListStore.getState

class ListActionStatic {
  upsertMany(lists: ListModelPoplutedFeeds[]) {
    if (lists.length === 0) return
    const feeds = [] as FeedModel[]
    set((state) => {
      for (const list of lists) {
        state.lists[list.id] = list

        if (list.feeds)
          for (const feed of list.feeds) {
            feeds.push(feed)
          }
      }

      feedActions.upsertMany(feeds)
      return state
    })
  }

  async fetchOwnedLists() {
    const res = await apiClient.lists.list.$get()
    this.upsertMany(res.data)

    return res.data
  }

  private patch(listId: string, data: Partial<ListModel>) {
    set((state) => {
      state.lists[listId] = { ...state.lists[listId], ...data }
      return state
    })
  }
  async addFeedToFeedList(listId: string, feed: FeedModel) {
    const list = get().lists[listId]
    if (!list) return
    feedActions.upsertMany([feed])

    this.patch(listId, {
      feedIds: [feed.id, ...list.feedIds],
    })
  }

  // TODO sync to index db
  async removeFeedFromFeedList(listId: string, feedId: string) {
    const list = get().lists[listId] as ListModel
    if (!list) return

    this.patch(listId, {
      feedIds: list.feedIds.filter((id) => id !== feedId),
    })
  }

  async fetchListById(id: string) {
    const res = await apiClient.lists.$get({ query: { listId: id } })

    this.upsertMany([res.data.list])
    return res.data
  }
}

export const listActions = new ListActionStatic()
