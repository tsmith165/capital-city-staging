/** `square_footage` renders as `Square Footage` on the field label and its tooltip. */
export function formatFieldName(name: string): string {
    return name
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
