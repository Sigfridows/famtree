import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReviewText, { formatSelection } from "@/features/reviews/components/ReviewText";
import ReviewComposer from "@/features/reviews/components/ReviewComposer";
import HeaderDesign from "@/components/shared/HeaderDesign";
afterEach(cleanup);
it("formats only selected text and leaves empty selections unchanged", () => {
 expect(formatSelection("Buena atención siempre", 6, 14, "bold")).toBe("Buena **atención** siempre");
 expect(formatSelection("atención", 0, 0, "italic")).toBe("atención");
});
it("renders only limited formatting and treats HTML and links as inert text", () => {
 const {container} = render(<ReviewText text={'**Buena** *atención* __siempre__ <img src=x onerror=alert(1)> [x](javascript:alert(1))'} />);
 expect(container.querySelector("strong")).toHaveTextContent("Buena");
 expect(container.querySelector("em")).toHaveTextContent("atención");
 expect(container.querySelector("u")).toHaveTextContent("siempre");
 expect(container.querySelector("img,a,script")).toBeNull();
});
it("publishes selected formatting rather than whole-message styling", async () => {
 const submit=vi.fn(async()=>({success:true}));
 render(<ReviewComposer asilos={[]} initialAsilo={{id: "3",name:"Centro"}} onSubmit={submit} />);
 const input=screen.getByPlaceholderText(/Escribe tu experiencia/) as HTMLTextAreaElement;
 fireEvent.change(input,{target:{value:"Buena atención siempre"}});
 input.setSelectionRange(6,14);
 fireEvent.click(screen.getByRole("button",{name:"Negrita"}));
 expect(input.value).toBe("Buena **atención** siempre");
 fireEvent.click(screen.getByRole("button",{name:"5 estrellas"}));
 await act(async()=>{fireEvent.click(screen.getByRole("button",{name:"Publicar"}));});
 expect(submit).toHaveBeenCalledWith("Buena **atención** siempre",5,expect.objectContaining({id:"3"}));
});
it.each(["***atención***", "*Muy **buena** atención*"])("supports combined selection formatting: %s", (text)=>{
 const {container}=render(<ReviewText text={text} />);
 expect(container.querySelector("strong")).not.toBeNull();
 expect(container.querySelector("em")).not.toBeNull();
 expect(container).toHaveTextContent(text === "***atención***" ? "atención" : "Muy buena atención");
 expect(container.textContent).not.toContain("*");
});
it("never shows the obsolete residence label",()=>{
 render(<HeaderDesign title="Mapa" />);
 expect(screen.queryByText("Información de residencias")).not.toBeInTheDocument();
});
