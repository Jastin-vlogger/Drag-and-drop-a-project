class CreateFrom {
  template: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLTextAreaElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    this.template = document.querySelector("#project-input")!;
    this.hostElement = <HTMLDivElement>document.getElementById("app")!;

    // Access the contents of the template
    let templateContent = this.template.content;

    // Create a new DOM element using the template
    const newItem = document.importNode(templateContent, true);
    this.formElement = newItem.firstElementChild as HTMLFormElement;
    this.formElement.id = "user-input";

    this.titleInputElement = document.getElementById(
      "title"
    ) as HTMLInputElement;
    this.descriptionInputElement = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = document.getElementById(
      "people"
    ) as HTMLInputElement;

    // Attaching the template to the dom
    this.attach();
    this.configure();
  }

  private configure() {
    this.formElement?.addEventListener("submit", this.submitHandler.bind(this));
  }

  submitHandler(event: SubmitEvent) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

const a = new CreateFrom();
