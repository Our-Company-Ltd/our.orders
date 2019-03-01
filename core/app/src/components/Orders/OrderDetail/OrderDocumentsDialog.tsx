import * as React from 'react';
import {
    Dialog, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, Button, DialogTitle
} from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';
import { Order, DocumentTemplate } from 'src/@types/our-orders';
import { DocumentTemplates } from 'src/_services';
import { Printer } from 'src/_helpers/print';
import OrderDocumentsDialogMessages from './OrderDocumentsDialogMessages';

export type OrderDocumentsDialogProps = InjectedIntlProps & {
    opened?: boolean;
    current: Order;
    onClose: () => void;
    templates: DocumentTemplate[];
};
type State = {
    templateId?: string;
};
export const PrintOrder = (templateId: string, current: Order) => {
    DocumentTemplates
        .Order(templateId, current.Id, current)
        .then((res) => {
            // var pop = window.open();
            // var template = Handlebars.compile(html);
            new Printer({
                content: () => (
                    <div
                        dangerouslySetInnerHTML={{ __html: res.html }}
                    />
                ),
                cssClasses: ['body--print-reciept'],
                cssStyles: res.styles,
                copyStyles: false
            }).Print();
        });
};
class OrderDocumentsDialog extends React.Component<OrderDocumentsDialogProps, State> {
    constructor(props: OrderDocumentsDialogProps) {
        super(props);
        this.state = {};
    }
    render() {
        const { opened, templates, onClose, intl: { formatMessage } } = this.props;
        const { templateId } = this.state;
        const change = (id: string) => this.setState(() => ({ templateId: id }));
        const print = () => templateId ? this._Print(templateId) : void 0;
        return (
            <Dialog open={!!opened} onClose={onClose}>
                <DialogTitle>
                    {formatMessage(OrderDocumentsDialogMessages.dialogTitle)}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {formatMessage(OrderDocumentsDialogMessages.inputLegend)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => change(e.target.value)}
                            value={templateId || ''}
                        >
                            {templates
                                .map(t => <MenuItem key={t.Id} value={t.Id}>{t.Title}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        color="primary"
                        disabled={!templateId}
                        variant="contained"
                        onClick={print}
                    >
                        {formatMessage(OrderDocumentsDialogMessages.actionPrint)}
                    </Button>
                </DialogActions>
            </Dialog>);
    }
    private _Print(templateId: string) {
        const { current } = this.props;
        PrintOrder(templateId, current);
    }
}
export default OrderDocumentsDialog;