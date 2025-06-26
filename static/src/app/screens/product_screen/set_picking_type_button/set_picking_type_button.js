/** @odoo-module **/

import {_t} from "@web/core/l10n/translation";
import {ProductScreen} from "@point_of_sale/app/screens/product_screen/product_screen";
import {useService} from "@web/core/utils/hooks";
import {SelectionPopup} from "@point_of_sale/app/utils/input_popups/selection_popup";
import {Component} from "@odoo/owl";
import {usePos} from "@point_of_sale/app/store/pos_hook";

export class ButtonSetPickingType extends Component {
    static template = "pos_retail.ButtonSetPickingType";

    setup() {
        super.setup();
        this.pos = usePos();
        this.popup = useService("popup");
    }

    get currentPickingTypeName() {
        if (this.pos.picking_type) {
            return this.pos.picking_type.display_name || this.pos.picking_type.name;
        }
        return _t('Set Operation Type');
    }

    async click() {
        if (!this.pos.config.multi_stock_operation_type_ids || !this.pos.stock_picking_type_by_id) {
            return;
        }
        const list = [];
        this.pos.config.multi_stock_operation_type_ids.forEach((id) => {
            const pt = this.pos.stock_picking_type_by_id[id];
            if (pt) {
                list.push({
                    id: pt.id,
                    label: pt.display_name || pt.name,
                    isSelected: this.pos.picking_type && this.pos.picking_type.id === pt.id,
                    item: pt,
                });
            }
        });
        if (!list.length) return;
        const { confirmed, payload } = await this.popup.add(SelectionPopup, {
            title: _t('Select Stock Operation Type'),
            list,
        });
        if (confirmed) {
            this.pos.picking_type = payload;
            if (payload.default_location_src_id) {
                this.pos.default_location_src_id = payload.default_location_src_id[0];
                if (this.pos.stock_location_by_id) {
                    this.pos.self_stock_location = this.pos.stock_location_by_id[payload.default_location_src_id[0]];
                }
            }
        }
    }
}

ProductScreen.addControlButton({
    component: ButtonSetPickingType,
    condition: function () {
        return this.env.pos.config.multi_stock_operation_type;
    },
});
