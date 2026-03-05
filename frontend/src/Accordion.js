import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({ className, ...props }) => (
  <AccordionPrimitive.Item
    className={`faq-item${className ? ' ' + className : ''}`}
    {...props}
  />
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = ({ className, children, ...props }) => (
  <AccordionPrimitive.Header className="faq-header">
    <AccordionPrimitive.Trigger
      className={`faq-trigger${className ? ' ' + className : ''}`}
      {...props}
    >
      {children}
      <ChevronDown className="faq-chevron" aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = ({ className, children, ...props }) => (
  <AccordionPrimitive.Content
    className={`faq-content${className ? ' ' + className : ''}`}
    {...props}
  >
    <div className="faq-content-inner">{children}</div>
  </AccordionPrimitive.Content>
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
