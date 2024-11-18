interface IProject {
  id: string;
  title: string;
  description: string;
  people: number;
}

// Singleton class for project state management
class ProjectState {
  private projects: IProject[] = [];
  private listeners: any[] = [];
  private static instance: ProjectState;
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = {
      id: crypto.randomUUID(),
      title,
      description,
      people: numOfPeople,
    };
    this.projects.push(newProject);
    for (const listener of this.listeners) {
      listener(this.projects);
    }
  }

  addListeners(listener: Function) {
    this.listeners.push(listener);
  }
}

const projectState = ProjectState.getInstance();
/**
 * For rendering project list
 */
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProject: IProject[];
  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProject = [];
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    this.attach();
    this.renderContent();
    projectState.addListeners((projects: any[]) => {
      this.assignedProject = projects;
      this.renderList();
    });
  }

  private renderList() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    for (const prjItem of this.assignedProject) {
      const li = document.createElement("li");
      li.textContent = prjItem.title;
      listEl.appendChild(li);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

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

    this.titleInputElement = this.formElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector(
      "#description"
    ) as HTMLTextAreaElement;
    this.peopleInputElement = this.formElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Attaching the template to the dom
    this.attach();
    this.configure();
  }

  @Autobind
  submitHandler(event: SubmitEvent) {
    event.preventDefault();
    console.log('clicking')
    const value = this.userInputsAndValidate();
    if (Array.isArray(value)) {
      const [title, descriptionInputValue, peopleInputValue] = value;
      projectState.addProject(title, descriptionInputValue, peopleInputValue);
      this.cleanUpTheForm();
    }
  }

  private userInputsAndValidate(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const descriptionInputValue = this.descriptionInputElement.value;
    const peopleInputValue = this.peopleInputElement.value;
    if (
      title.trim().length === 0 ||
      descriptionInputValue.trim().length === 0 ||
      peopleInputValue.trim().length === 0
    ) {
      alert("Some input are not valid");
      return;
    } else {
      return [title, descriptionInputValue, +peopleInputValue];
    }
  }

  private cleanUpTheForm() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private configure() {
    this.formElement?.addEventListener("submit", this.submitHandler);
  }

  attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

const form = new CreateFrom();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");

/**
 * A decorator that automatically binds a method's `this` context to the instance
 * of the class it belongs to. This is useful for ensuring consistent `this` behavior
 * when methods are used as callbacks or event handlers, eliminating the need for
 * manual `.bind(this)` calls.
 * @param {any} _target
 * @param {string} _propertyKey
 * @param {PropertyDescriptor} descriptor
 * @returns
 */
function Autobind(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalFn = descriptor.value;
  const adjFn: PropertyDescriptor = {
    enumerable: true,
    configurable: true,
    get() {
      const boundFn = originalFn.bind(this);
      return boundFn;
    },
  };
  return adjFn;
}
