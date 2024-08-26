export const InputUtil = {
    numericInputKeyDown(event, currentValue, onChange) {
        const allowedKeys = [
            'Backspace',
            'Meta',
            'Ctrl',
            'a',
            'A',
            'c',
            'C',
            'x',
            'X',
            'v',
            'V',
            'ArrowLeft',
            'ArrowRight',
            'Tab'
        ];
        const controlPressed = event.metaKey || event.ctrlKey;
        const eventKey = event.key;
        const lowercaseEventKey = eventKey.toLocaleLowerCase();
        const selectAll = lowercaseEventKey === 'a';
        const copyKey = lowercaseEventKey === 'c';
        const pasteKey = lowercaseEventKey === 'v';
        const cutKey = lowercaseEventKey === 'x';
        const isComma = eventKey === ',';
        const isDot = eventKey === '.';
        const isNumericKey = eventKey >= '0' && eventKey <= '9';
        if (!controlPressed && (selectAll || copyKey || pasteKey || cutKey)) {
            event.preventDefault();
        }
        if (currentValue === '0' && !isComma && !isDot && eventKey === '0') {
            event.preventDefault();
        }
        if (currentValue === '0' && isNumericKey) {
            onChange(eventKey);
            event.preventDefault();
        }
        if (isComma || isDot) {
            if (!currentValue) {
                onChange('0.');
                event.preventDefault();
            }
            if (currentValue?.includes('.') || currentValue?.includes(',')) {
                event.preventDefault();
            }
        }
        if (!isNumericKey && !allowedKeys.includes(eventKey) && !isDot && !isComma) {
            event.preventDefault();
        }
    }
};
//# sourceMappingURL=InputUtil.js.map