const isDev = import.meta.env.DEV;
const baseHref =  !isDev ? import.meta.env.BASE_URL : '';

export function computeUrl(link: string): string {
    return `${baseHref}/${link}`.replace('//', '/');
}