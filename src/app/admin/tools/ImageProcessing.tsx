/**
 * Thumbnails and dimensions used to be two tabs, each with a disabled button explaining that the
 * feature had moved into the upload pipeline. Two dead tabs read as two broken tools, and the
 * replacement then explained its own implementation history to the operator. One line is enough.
 */
export default function ImageProcessing() {
    return <p className="text-body-muted p-5 text-sm">Thumbnails and dimensions are handled during upload.</p>;
}
