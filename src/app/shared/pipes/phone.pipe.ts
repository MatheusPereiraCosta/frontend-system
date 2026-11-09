import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhonePipe implements PipeTransform {
  transform(phone: string | null | undefined): string {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
  }
}
