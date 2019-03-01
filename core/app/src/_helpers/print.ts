import * as ReactDOM from 'react-dom';
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';

interface PrinterOptions {
    content: () => JSX.Element;
    copyStyles?: boolean;
    onBeforePrint?: () => void;
    onAfterPrint?: () => void;
    cssClasses?: string[];
    cssStyles?: string;
}

export const ReactToCanvas = (elt: JSX.Element): Promise<HTMLCanvasElement> => {

    return new Promise((resolve, reject) => {
        var target = document.createElement('div');
        const { documentElement } = document;
        if (!documentElement) {
            reject('no document element');
            return;
        }
        documentElement.appendChild(target);
        ReactDOM.render(elt, target, () => {
            var torender = target.querySelector('*') as HTMLElement;
            if (!torender) {
                reject();
                return;
            }
            html2canvas(torender)
                .then((canvas) => {
                    resolve(canvas);
                    documentElement.removeChild(target);

                })
                .catch(reject);
        });
    });
};

export const HTMLStringToCanvas = (input: string): Promise<HTMLCanvasElement> => {

    return new Promise((resolve, reject) => {
        var target = document.createElement('div');
        const { documentElement } = document;
        if (!documentElement) {
            reject('no document element');
            return;
        }
        documentElement.appendChild(target);
        target.innerHTML = input;
        var torender = target.querySelector('*') as HTMLElement;
        if (!torender) {
            reject();
            return;
        }
        html2canvas(torender)
            .then((canvas) => {
                resolve(canvas);
                documentElement.removeChild(target);

            })
            .catch(reject);
    });
};

export const ToPdf = (canvas: HTMLCanvasElement, fileName: string) => {
    const r = canvas.width / canvas.height;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        unit: 'mm',
        format: ['80', (r * 80).toString()]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0);
    // pdf.output('dataurlnewwindow');
    pdf.save(fileName);
};

const dataURLtoBlob = (dataurl: string) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
const saveData = (blob: Blob, fileName: string) => {
    const a = document.createElement('a');

    document.body.appendChild(a);

    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    a.click();
    window.URL.revokeObjectURL(url);
};
export const PrintLink = (url: string, fileName: string) => {
    const blob = dataURLtoBlob(url);

    saveData(blob, fileName);
    // // const printWindow = window.open(url, 'Print', 'status=no, toolbar=no, scrollbars=yes', false);
    // var printWindow = window.open();
    // if (!printWindow) { return; }
    // const styles = 'border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;';
    // printWindow.document.write(
    //     `<iframe src='${url}' frameborder="0" style="${styles}" allowfullscreen></iframe>`);
    // printWindow.onload = () => {

    //     // tslint:disable-next-line:no-unused-expression
    //     printWindow &&
    //         // tslint:disable-next-line:no-string-literal
    //         printWindow['print']();
    // };
};

export class Printer {
    linkLoaded: number;
    linkTotal: number;
    imageLoaded: number;
    imageTotal: number;
    private _options: PrinterOptions;

    constructor(options: PrinterOptions) {
        this._options = options;
    }

    public Print() {
        const {
            content,
            copyStyles,
            cssStyles,
            cssClasses,
            onAfterPrint
        } = this._options;

        const printWindow = window.open('', 'Print', 'status=no, toolbar=no, scrollbars=yes', false);
        if (!printWindow) { return; }

        if (onAfterPrint) {
            printWindow.onbeforeunload = onAfterPrint;
        }

        const contentEl = content();
        const container = document.createElement('div');
        ReactDOM.render(contentEl, container, () => {
            const imageNodes = Array.from(container.getElementsByTagName('img'));
            const linkNodes = document.querySelectorAll('link[rel="stylesheet"]');

            this.imageTotal = imageNodes.length;
            this.imageLoaded = 0;

            this.linkTotal = linkNodes.length;
            this.linkLoaded = 0;

            const markLoaded = (type: 'image' | 'link') => {

                if (type === 'image') {
                    this.imageLoaded++;
                } else if (type === 'link') {
                    this.linkLoaded++;
                }

                if (this.imageLoaded === this.imageTotal && this.linkLoaded === this.linkTotal) {
                    this._triggerPrint(printWindow);
                }

            };

            [...imageNodes].forEach((child) => {
                /** Workaround for Safari if the image has base64 data as a source */
                if (/^data:/.test(child.src)) {
                    child.crossOrigin = 'anonymous';
                }
                child.setAttribute('src', child.src);
                child.onload = markLoaded.bind(null, 'image');
                child.onerror = markLoaded.bind(null, 'image');
                child.crossOrigin = 'use-credentials';
            });

            /*
             * IE does not seem to allow appendChild from different window contexts correctly.  They seem to come back
             * as plain objects. In order to get around this each tag is re-created into the printWindow
             * https://stackoverflow.com/questions/38708840
             * /calling-adoptnode-and-importnode-on-a-child-window-fails-in-ie-and-edge
             */
            const { location } = document;
            if (copyStyles !== false && location) {

                const headEls = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
                [...headEls].forEach(node => {

                    let newHeadEl = printWindow.document.createElement(node.tagName);

                    if (node.textContent) {
                        newHeadEl.textContent = node.textContent;
                        // tslint:disable-next-line:no-string-literal
                    } else if (node['innerText']) {
                        // tslint:disable-next-line:no-string-literal
                        newHeadEl.innerText = node['innerText'];
                    }

                    let attributes = Array.from(node.attributes);
                    attributes.forEach(attr => {

                        const nodeValue = attr.nodeValue;
                        let newNodeValue = nodeValue;

                        if (nodeValue && attr.nodeName === 'href' && /^https?:\/\//.test(nodeValue) === false) {

                            const relPath = nodeValue.substr(0, 3) === '../' 
                                ? location.pathname.replace(/[^/]*$/, '')
                                : '/';

                            newNodeValue =
                                location.protocol + '//' + location.host + relPath + nodeValue;

                        }

                        newHeadEl.setAttribute(attr.nodeName, newNodeValue || '');
                    });

                    if (node.tagName === 'LINK') {
                        newHeadEl.onload = markLoaded.bind(null, 'link');
                        newHeadEl.onerror = markLoaded.bind(null, 'link');
                    }

                    printWindow.document.head!.appendChild(newHeadEl);

                });

            }

            if (document.body.className) {
                const bodyClasses = document.body.className.split(' ');
                bodyClasses.map(item => printWindow.document.body.classList.add(item));
            }

            if (cssClasses) {
                cssClasses.forEach(cssClass => printWindow.document.body.classList.add(cssClass));
            }

            /* remove date/time from top */
            let styleEl = printWindow.document.createElement('style');
            const styles = `
                ${cssStyles ? cssStyles : ''}
            `;

            styleEl.appendChild(printWindow.document.createTextNode(styles));

            printWindow.document.head!.appendChild(styleEl);
            printWindow.document.body.innerHTML = container.outerHTML;

            if (this.imageTotal === 0 || copyStyles === false) {
                this._triggerPrint(printWindow);
            }
        });
    }

    private _triggerPrint(target: Window) {
        if (this._options.onBeforePrint) {
            this._options.onBeforePrint();
        }
        setTimeout(
            () => {
                // tslint:disable-next-line:no-string-literal
                target['print']();
                // target.close();
            },
            500);
    }
}
