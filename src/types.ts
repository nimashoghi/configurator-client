export interface Settings {
    PodBean: {
        ClientId: string
        ClientSecret: string
        [k: string]: any
    }
    YouTube: {
        ChannelId: string
        PollingRate: number
        TitlePattern: string
        TitleNegativePattern: string
        CustomVideos: [string]
        [k: string]: any
    }
    Pickle?: {
        AccessCode?: string
        Processed?: string
        PlaylistHistory?: string
        [k: string]: any
    }
    Server: {
        Host: string
        Port: string
        PublicHost: string
        [k: string]: any
    }
    [k: string]: any
}
